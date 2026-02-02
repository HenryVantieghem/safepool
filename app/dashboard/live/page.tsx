"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";

type AnalysisResult = {
  distress: boolean;
  confidence: number;
  description: string;
  mock?: boolean;
};

type Facility = { id: string; name: string };
type Camera = { id: string; name: string; facility_id: string };

export default function LiveFeedsPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"demo" | "upload">("demo");
  const [videoUrl, setVideoUrl] = useState<string | null>("/demo/pool-demo.mp4");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const lastAlertRef = useRef<number>(0);
  const COOLDOWN_MS = 15000;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: facData } = await supabase.from("facilities").select("id, name");
      const { data: camData } = await supabase.from("cameras").select("id, name, facility_id");
      setFacilities(facData ?? []);
      setCameras(camData ?? []);
      if (facData?.length) setSelectedFacility(facData[0].id);
      if (camData?.length) setSelectedCamera(camData[0].id);
    }
    load();
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || video.paused) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.min(video.videoWidth, 640);
    canvas.height = Math.min(video.videoHeight, 480);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
    if (!base64) return;

    setAnalyzing(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data: AnalysisResult = await res.json();
      setResult(data);

      if (data.distress && data.confidence >= 0.5) {
        const now = Date.now();
        if (now - lastAlertRef.current > COOLDOWN_MS) {
          lastAlertRef.current = now;
          setAlert(`Distress detected: ${data.description}`);
          if (typeof Audio !== "undefined") {
            try {
              const audio = new Audio("/demo/alert.mp3");
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch {}
          }
          if (selectedFacility) {
            fetch("/api/incidents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                facility_id: selectedFacility,
                camera_id: selectedCamera || null,
                severity: data.confidence >= 0.8 ? "high" : "medium",
                frame_data: {
                  description: data.description,
                  confidence: data.confidence,
                },
              }),
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      setResult({
        distress: false,
        confidence: 0,
        description: err instanceof Error ? err.message : "Analysis failed",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [selectedFacility, selectedCamera]);

  useEffect(() => {
    const id = setInterval(captureAndAnalyze, 3000);
    return () => clearInterval(id);
  }, [captureAndAnalyze]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setMode("upload");
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-teal-deep">Live Feeds</h1>
      <p className="mt-2 text-gray-600">
        Monitor camera feeds with AI distress detection. Use demo video or upload your own.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={() => {
            setVideoUrl("/demo/pool-demo.mp4");
            setMode("demo");
          }}
          className={`rounded-lg px-4 py-2 text-sm ${
            mode === "demo"
              ? "bg-teal-deep text-white"
              : "border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Demo Video
        </button>
        <label className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
          Upload Video
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {facilities.length > 0 && (
        <div className="mt-4 flex gap-4">
          <div>
            <label className="text-sm text-gray-600">Facility</label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Camera</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="relative mt-6 inline-block">
        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 bg-black">
          <video
            ref={videoRef}
            src={videoUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            className="max-h-[480px] w-full"
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(() => {});
              }
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
          {result?.distress && result.confidence >= 0.5 && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-red-500/20"
              role="alert"
              aria-live="assertive"
            >
              <span className="rounded-lg bg-red-600 px-4 py-2 text-lg font-bold text-white">
                DISTRESS
              </span>
            </div>
          )}
          {analyzing && (
            <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
              Analyzing...
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-teal-deep">Latest analysis</h3>
          <p className="mt-2 text-sm text-gray-600">{result.description}</p>
          <p className="mt-1 text-sm">
            Distress:{" "}
            <span className={result.distress ? "text-red-600 font-medium" : "text-gray-600"}>
              {result.distress ? "Yes" : "No"}
            </span>{" "}
            · Confidence: {(result.confidence * 100).toFixed(0)}%
            {result.mock && (
              <span className="ml-2 text-amber-600">(mock mode)</span>
            )}
          </p>
        </div>
      )}

      {alert && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border-2 border-red-500 bg-red-50 p-4 shadow-lg"
        >
          <p className="font-medium text-red-800">{alert}</p>
          <button
            onClick={() => setAlert(null)}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!videoUrl && (
        <p className="mt-4 text-sm text-gray-500">
          Add a demo video at <code className="rounded bg-gray-100 px-1">public/demo/pool-demo.mp4</code> or upload one.
        </p>
      )}
    </div>
  );
}

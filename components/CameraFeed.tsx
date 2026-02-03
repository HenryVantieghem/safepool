"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Hls from "hls.js";

export type AnalysisResult = {
  distress: boolean;
  confidence: number;
  description: string;
  submerged?: boolean;
  mock?: boolean;
};

type CameraFeedProps = {
  cameraId: string;
  cameraName: string;
  sourceType: "browser" | "hls" | "file" | "upload";
  streamUrl?: string | null;
  facilityId: string;
  sensitivity: "low" | "medium" | "high";
  underwaterThresholdSeconds: number;
  onAlert?: (payload: {
    severity: string;
    trigger_type: string;
    description: string;
    frame_data: Record<string, unknown>;
  }) => void;
  statusOverride?: "live" | "reconnecting" | "offline";
};

const FPS_MS: Record<string, number> = {
  low: 2000,
  medium: 1000,
  high: 500,
};

export function CameraFeed({
  cameraId,
  cameraName,
  sourceType,
  streamUrl,
  facilityId,
  sensitivity,
  underwaterThresholdSeconds,
  onAlert,
  statusOverride,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"live" | "reconnecting" | "offline">("offline");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisPaused, setAnalysisPaused] = useState(false);
  const [submergedSince, setSubmergedSince] = useState<number | null>(null);
  const lastAlertRef = useRef(0);
  const COOLDOWN_MS = 15000;

  const intervalMs = FPS_MS[sensitivity] ?? 1000;

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || analysisPaused || video.readyState < 2 || video.paused) return;

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
      const data = (await res.json()) as AnalysisResult & { error?: string };
      if (data.error) {
        setResult({
          distress: false,
          confidence: 0,
          description: data.error,
          submerged: false,
        });
        setSubmergedSince(null);
        return;
      }
      setResult(data);

      const now = Date.now();
      const submerged = data.submerged && data.confidence >= 0.5;
      if (submerged) {
        const since = submergedSince ?? now;
        if (submergedSince === null) setSubmergedSince(now);
        if (now - since >= underwaterThresholdSeconds * 1000 && now - lastAlertRef.current > COOLDOWN_MS) {
          lastAlertRef.current = now;
          setSubmergedSince(null);
          onAlert?.({
            severity: data.confidence >= 0.8 ? "high" : "medium",
            trigger_type: "underwater_time",
            description: data.description ?? "Person submerged too long",
            frame_data: { description: data.description, confidence: data.confidence, trigger: "underwater_time" },
          });
        }
      } else {
        setSubmergedSince(null);
        if (data.distress && data.confidence >= 0.5 && now - lastAlertRef.current > COOLDOWN_MS) {
          lastAlertRef.current = now;
          onAlert?.({
            severity: data.confidence >= 0.8 ? "high" : "medium",
            trigger_type: "distress",
            description: data.description ?? "Distress detected",
            frame_data: { description: data.description, confidence: data.confidence, trigger: "distress" },
          });
        }
      }
    } catch (err) {
      setResult({
        distress: false,
        confidence: 0,
        description: err instanceof Error ? err.message : "Analysis failed",
        submerged: false,
      });
      setSubmergedSince(null);
    } finally {
      setAnalyzing(false);
    }
  }, [analysisPaused, sensitivity, submergedSince, underwaterThresholdSeconds, onAlert]);

  useEffect(() => {
    if (analysisPaused) return;
    const id = setInterval(captureAndAnalyze, intervalMs);
    return () => clearInterval(id);
  }, [captureAndAnalyze, analysisPaused, intervalMs]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (sourceType === "browser") {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 } })
        .then((stream) => {
          streamRef.current = stream;
          video.srcObject = stream;
          video.play().catch(() => {});
          setStatus("live");
        })
        .catch(() => setStatus("offline"));
      return () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        video.srcObject = null;
      };
    }

    if (sourceType === "hls" && streamUrl && Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus("live"));
      hls.on(Hls.Events.ERROR, (_, d) => {
        if (d.fatal) setStatus("offline");
      });
      video.play().catch(() => {});
      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    if (sourceType === "hls" && streamUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadeddata", () => setStatus("live"));
      video.play().catch(() => {});
      return () => {
        video.removeEventListener("loadeddata", () => {});
        video.src = "";
      };
    }

    if ((sourceType === "file" || sourceType === "upload") && streamUrl) {
      video.src = streamUrl;
      video.addEventListener("loadeddata", () => setStatus("live"));
      video.play().catch(() => {});
      return () => {
        video.src = "";
      };
    }

    setStatus("offline");
  }, [sourceType, streamUrl]);

  const displayStatus = statusOverride ?? status;
  const statusColor =
    displayStatus === "live"
      ? "bg-emerald-500"
      : displayStatus === "reconnecting"
        ? "bg-amber-500"
        : "bg-zinc-400";

  const handleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!document.fullscreenElement) {
      video.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-zinc-700">
      <div className="relative aspect-video w-full">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
          onError={() => setStatus("offline")}
        />
        <canvas ref={canvasRef} className="hidden" />

        <div className="absolute left-2 top-2 flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${statusColor}`}
            title={displayStatus}
          />
          <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {cameraName}
          </span>
        </div>

        {analyzing && (
          <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white">
            Analyzing...
          </div>
        )}

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

        <div className="absolute bottom-2 left-2 right-2 flex justify-between">
          <button
            type="button"
            onClick={() => setAnalysisPaused((p) => !p)}
            className="rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            {analysisPaused ? "Resume analysis" : "Pause analysis"}
          </button>
          <button
            type="button"
            onClick={handleFullscreen}
            className="rounded bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
          >
            Fullscreen
          </button>
        </div>
      </div>

      {result && (
        <div className="border-t border-gray-200 bg-gray-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="line-clamp-2 text-xs text-gray-600 dark:text-zinc-400">
            {result.description}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-500">
            Distress: {result.distress ? "Yes" : "No"} · Confidence: {(result.confidence * 100).toFixed(0)}%
            {result.mock && " (mock)"}
          </p>
        </div>
      )}
    </div>
  );
}

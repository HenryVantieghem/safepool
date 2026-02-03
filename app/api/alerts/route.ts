import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  let body: {
    facility_id?: string;
    camera_id?: string;
    severity?: string;
    trigger_type?: string;
    description?: string;
    frame_data?: Record<string, unknown>;
    thumbnail_url?: string;
    create_incident?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const facility_id = body.facility_id;
  const camera_id = body.camera_id ?? null;
  const severity = body.severity ?? "medium";
  const trigger_type = body.trigger_type ?? "distress";
  const description = body.description ?? null;
  const frame_data = body.frame_data ?? null;
  const thumbnail_url = body.thumbnail_url ?? null;
  const create_incident = body.create_incident !== false;

  if (!facility_id) {
    return NextResponse.json(
      { error: "facility_id required" },
      { status: 400 }
    );
  }

  const { data: alert, error: alertError } = await supabase
    .from("alerts")
    .insert({
      facility_id,
      camera_id,
      severity,
      trigger_type,
      description,
      frame_data,
      thumbnail_url,
    })
    .select()
    .single();

  if (alertError) {
    return NextResponse.json({ error: alertError.message }, { status: 500 });
  }

  if (create_incident) {
    await supabase.from("incidents").insert({
      facility_id,
      camera_id,
      severity,
      frame_data: frame_data ?? { description, trigger_type },
    });
  }

  return NextResponse.json(alert);
}

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
    frame_data?: Record<string, unknown>;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const facility_id = body.facility_id;
  const camera_id = body.camera_id || null;
  const severity = body.severity || "medium";
  const frame_data = body.frame_data || null;

  if (!facility_id) {
    return NextResponse.json(
      { error: "facility_id required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("incidents")
    .insert({
      facility_id,
      camera_id,
      severity,
      frame_data,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

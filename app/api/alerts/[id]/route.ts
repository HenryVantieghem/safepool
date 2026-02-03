import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  let body: { dismissed_at?: string | null };
  try {
    body = await _request.json();
  } catch {
    body = {};
  }

  const updates: { dismissed_at?: string | null } = {};
  if (body.dismissed_at !== undefined) {
    updates.dismissed_at = body.dismissed_at;
  }
  if (Object.keys(updates).length === 0) {
    updates.dismissed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("alerts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      institution,
      profile_pic,
      campus_email,
      campus_verified,
      verified_at,
      notification_settings,
      privacy_settings,
    } = body;

    const updates: Record<string, any> = {};

    if (typeof name !== "undefined") updates.name = name;
    if (typeof institution !== "undefined") updates.institution = institution;
    if (typeof profile_pic !== "undefined") updates.profile_pic = profile_pic;
    if (typeof campus_email !== "undefined") updates.campus_email = campus_email;
    if (typeof campus_verified !== "undefined")
      updates.campus_verified = campus_verified;
    if (typeof verified_at !== "undefined") updates.verified_at = verified_at;
    if (typeof notification_settings !== "undefined")
      updates.notification_settings = notification_settings;
    if (typeof privacy_settings !== "undefined")
      updates.privacy_settings = privacy_settings;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No profile fields provided" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

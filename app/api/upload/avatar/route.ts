import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Must be an image" }, { status: 400 });
    }
    if (file.size > 800 * 1024) {
      return NextResponse.json({ error: "Max 800KB" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload using service role (bypasses RLS) or server-side auth
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("Avatars").getPublicUrl(filePath);

    // Update user record
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({ profile_pic: filePath })
      .eq("id", user.id)
      .select()
      .single();

    if (userError) {
      console.error("User update error:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      filePath,
      publicUrl,
      user: userData,
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

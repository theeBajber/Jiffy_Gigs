import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all messages where current user is involved
    const { data: messages, error: msgError } = await supabase
      .from("messages")
      .select("sender_id, receiver_id")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (msgError) {
      console.error("Error fetching messages:", msgError);
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Extract unique user IDs (everyone the current user has chatted with)
    const userIds = new Set<string>();

    messages?.forEach((msg) => {
      if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
      if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
    });

    if (userIds.size === 0) {
      return NextResponse.json([]);
    }

    // Fetch user details
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, name, profile_pic, institution")
      .in("id", Array.from(userIds));

    if (userError) {
      console.error("Error fetching users:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

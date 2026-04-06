import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const { searchParams } = new URL(req.url);
    const receiverId = searchParams.get("receiverId");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!receiverId) {
      return NextResponse.json(
        { error: "receiverId required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, context } = body;

    if (!receiverId || !context?.trim()) {
      return NextResponse.json(
        { error: "receiverId and context required" },
        { status: 400 },
      );
    }

    // Prevent self-messaging
    if (receiverId === user.id) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        context: context.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

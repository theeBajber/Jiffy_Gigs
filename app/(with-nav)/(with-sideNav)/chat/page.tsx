import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get users you've chatted with
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  const userIds = new Set<string>();

  messages?.forEach((msg) => {
    if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
    if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
  });

  const firstUserId = Array.from(userIds)[0];

  if (!firstUserId) {
    return (
      <div className="w-full h-[85vh] flex flex-col items-center justify-center text-primary-dark/50 gap-4">
        <div className="w-20 h-20 bg-primary-light/10 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Visit a profile to start chatting</p>
        </div>
      </div>
    );
  }

  redirect(`/chat/${firstUserId}`);
}

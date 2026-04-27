"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { LeftBubble, RightBubble } from "@/app/ui/bubbles";
import { poppins } from "@/app/ui/fonts";
import {
  CirclePlus,
  ImageIcon,
  InfoIcon,
  MoreVertical,
  ReceiptText,
  Search,
  Send,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/authcontext";

type User = {
  id: string;
  name: string;
  profile_pic: string | null;
  institution?: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  context: string;
  created_at: string;
};

export default function Chat() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch sidebar users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/chat/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load contacts");
      }
    }
    fetchUsers();
  }, []);

  // Set selected user when URL changes or users load
  useEffect(() => {
    if (!userId || users.length === 0) return;
    const found = users.find((u) => u.id === userId);
    setSelectedUser(found || null);
  }, [userId, users]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!userId || !currentUser?.id) return;

    setLoading(true);
    setError(null);

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/chat?receiverId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();

        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error("Unexpected response:", data);
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [userId, currentUser?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!currentUser?.id || !userId) return;

    const channelName = `messages-${[currentUser.id, userId].sort().join("-")}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // Filter at DB level — only rows involving current user
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // Still check it's this specific conversation
          if (newMsg.sender_id !== userId) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .subscribe((status) => {
        console.log("Realtime status:", status); // debug
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentUser?.id]);

  const handleMessage = async () => {
    if (!inputMessage.trim() || !userId || !currentUser?.id || sending) return;

    const trimmedMessage = inputMessage.trim();
    setSending(true);
    setError(null);

    // Optimistic update with temp ID
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: userId,
      context: trimmedMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: userId,
          context: trimmedMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const savedMsg = await res.json();

      // Replace temp message with saved one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? savedMsg : msg)),
      );
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      // Restore input
      setInputMessage(trimmedMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessage();
    }
  };

  const handleUserSelect = useCallback(
    (id: string) => {
      router.push(`/chat/${id}`);
    },
    [router],
  );

  if (!currentUser) {
    return (
      <div className="w-full h-[85vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-light" />
      </div>
    );
  }

  return (
    <section className="w-full flex h-[85vh] ml-4 bg-secondary/30 rounded-lg overflow-hidden">
      {/* SIDEBAR */}
      <div className="h-full w-96 flex flex-col border-r border-primary-dark/50 bg-white/50">
        <div className="w-[90%] bg-secondary/50 h-10 rounded-3xl flex items-center px-4 gap-2 my-4 mx-auto">
          <Search className="size-5 text-primary-light" />
          <input
            className="outline-none w-full bg-transparent"
            placeholder="Search contacts..."
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-primary-dark/50 text-sm">
              No conversations yet
            </div>
          ) : (
            users.map((user) => (
              <ContactCard
                key={user.id}
                name={user.name}
                avatar={user.profile_pic || "/portraits/person1.jpg"}
                isSelected={user.id === userId}
                onClick={() => handleUserSelect(user.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex flex-col min-h-0 w-full bg-white/30">
        {/* HEADER */}
        <div className="h-20 flex items-center justify-between px-6 border-b bg-white/50 backdrop-blur-sm">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.profile_pic || "/portraits/person1.jpg"}
                  className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
                  alt={selectedUser.name}
                />
                <div>
                  <h2 className={`${poppins.className} text-xl font-semibold`}>
                    {selectedUser.name}
                  </h2>
                  {selectedUser.institution && (
                    <p className="text-xs text-primary-dark/60">
                      {selectedUser.institution}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 text-primary-dark/60">
                <button className="hover:text-primary-light transition-colors">
                  <ReceiptText size={20} />
                </button>
                <button className="hover:text-primary-light transition-colors">
                  <InfoIcon size={20} />
                </button>
                <button className="hover:text-primary-light transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="text-primary-dark/50">Select a conversation</div>
          )}
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4 rounded">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-primary-light" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-primary-dark/50 gap-4">
              <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-primary-light" />
              </div>
              <div className="text-center">
                <p className="font-medium">No messages yet</p>
                <p className="text-sm">Say hi to start the conversation! 👋</p>
              </div>
            </div>
          ) : (
            messages.map((msg) =>
              msg.sender_id === currentUser.id ? (
                <RightBubble
                  key={msg.id}
                  content={msg.context}
                  time={new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  status={msg.id.startsWith("temp-") ? "sending" : "sent"}
                />
              ) : (
                <LeftBubble
                  key={msg.id}
                  content={msg.context}
                  time={new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  avatar={selectedUser?.profile_pic || "/portraits/person1.jpg"}
                />
              ),
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="h-20 flex items-center px-4 border-t bg-white/50 gap-3">
          <button className="text-primary-dark/40 hover:text-primary-light transition-colors">
            <CirclePlus size={24} />
          </button>
          <button className="text-primary-dark/40 hover:text-primary-light transition-colors">
            <ImageIcon size={24} />
          </button>

          <input
            className="flex-1 outline-none bg-white/80 rounded-full px-4 py-2 border border-transparent focus:border-primary-light/30 transition-all"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending || !selectedUser}
          />

          <button
            onClick={handleMessage}
            disabled={sending || !inputMessage.trim() || !selectedUser}
            className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  avatar,
  name,
  isSelected,
  onClick,
}: {
  avatar: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-20 flex items-center px-4 gap-4 border-b border-primary-dark/10 transition-all hover:bg-secondary/30 ${
        isSelected ? "bg-secondary/50 border-l-4 border-l-primary-light" : ""
      }`}
    >
      <img
        src={avatar}
        className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
        alt={name}
      />
      <div className="text-left">
        <h2 className="font-semibold text-slate-900">{name}</h2>
        <p className="text-xs text-slate-500">Click to chat</p>
      </div>
    </button>
  );
}

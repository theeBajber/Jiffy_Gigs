import { supabase } from "@/lib/supabase";

export function transformGigData(gig: any) {
  const getDurationPosted = (createdAt: string) => {
    const now = new Date();
    const posted = new Date(createdAt);
    const diffInHours = Math.floor(
      (now.getTime() - posted.getTime()) / (1000 * 60 * 60),
    );
    if (diffInHours < 1) return "Just Now";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    if (diffInHours < 48) return `Yesterday`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };
  let coverUrl = "/cover.png";

  if (gig.cover) {
    const { data } = supabase.storage.from("GigCovers").getPublicUrl(gig.cover);
    coverUrl = data.publicUrl;
  }
  const bookings = Array.isArray(gig.bookings) ? gig.bookings : [];
  const isTaken = bookings.some(
    (booking: { status?: string; payment_status?: string }) =>
      booking?.status === "pending" ||
      booking?.status === "active" ||
      booking?.payment_status === "paid" ||
      booking?.payment_status === "completed",
  );

  return {
    id: gig.id,
    title: gig.title,
    description: gig.description || "",
    category: gig.categories?.name || "General",
    createdAt: gig.created_at,
    price: Number(gig.price) || 0,
    durationPosted: getDurationPosted(gig.created_at),
    tags: Array.isArray(gig.tags) ? gig.tags : [],
    giggerAvatar: gig.users?.profile_pic || "/portraits/person1.jpg",
    gigger: gig.users?.name || "Campus Provider",
    charges: `${gig.price} / ${gig.per}`,
    image: coverUrl,
    proximity: gig.location || "On campus",
    isAvailable: !isTaken,
  };
}

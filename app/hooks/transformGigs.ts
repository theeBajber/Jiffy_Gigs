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
  let coverUrl = "/portraits/person1.jpg";

  if (gig.cover) {
    const { data } = supabase.storage.from("GigCovers").getPublicUrl(gig.cover);
    coverUrl = data.publicUrl;
  }
  return {
    id: gig.id,
    title: gig.title,
    description: gig.description || "",
    category: gig.categories?.name,
    durationPosted: getDurationPosted(gig.created_at),
    tags: gig.tags || ["aloe", "vera"],
    giggerAvatar: gig.users?.pic || "/portraits/person1.jpg",
    gigger: gig.users?.name,
    charges: `${gig.price} / ${gig.per}`,
    image: coverUrl,
    proximity: gig.location,
  };
}

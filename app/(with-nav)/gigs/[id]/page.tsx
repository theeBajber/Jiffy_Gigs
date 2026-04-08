import { transformGigData } from "@/app/hooks/transformGigs";
import { DatabaseGig } from "@/app/types";
import BookButton from "@/app/ui/bookButton";
import { poppins } from "@/app/ui/fonts";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  ArrowLeft,
  BadgeCheck,
  DollarSign,
  MapPin,
  MessageCircleMore,
  StarIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: gig } = await supabase
    .from("gigs")
    .select(`title, description, categories(name)`)
    .eq("id", id)
    .single();
  if (!gig) {
    return {
      title: "Gig Not Found",
    };
  }
  return {
    title: `${gig?.title} | Jiffy Gigs`,
    description: gig.description.substring(0, 160),
  };
}
export default async function GigDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: gig, error } = await supabase
    .from("gigs")
    .select(
      `*, categories(name), users:posted_by(name,profile_pic,institution, campus_verified), bookings(status, payment_status)`,
    )
    .eq("id", id)
    .single();
  if (error || !gig) {
    console.error("Error fetching gig:", error);
    notFound();
  }
  const transformedGig = transformGigData(gig as DatabaseGig);
  const isAvailable = !(gig.bookings || []).some(
    (booking: { status?: string; payment_status?: string }) =>
      booking?.status === "pending" ||
      booking?.status === "active" ||
      booking?.payment_status === "paid" ||
      booking?.payment_status === "completed",
  );
  let rating = 0;
  let reviewCount = 0;
  let latestReviews: any[] = [];
  const subcategory = "Hair Grooming";
  const formattedPrice = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(gig.price);
  let coverUrl: string | undefined = undefined;

  if (gig.cover) {
    const { data } = supabase.storage.from("GigCovers").getPublicUrl(gig.cover);

    coverUrl = data.publicUrl;
  }

  const { data: portfolios } = await supabase
    .from("portfolios")
    .select("id, file_path, file_name")
    .eq("gig_id", id)
    .order("uploaded_at", { ascending: false });

  try {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, reviewer:users!reviewer_id(name)")
      .eq("seller_id", gig.posted_by)
      .order("created_at", { ascending: false })
      .limit(10);

    latestReviews = reviews || [];
    reviewCount = latestReviews.length;
    rating =
      reviewCount > 0
        ? Number(
            (
              latestReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              reviewCount
            ).toFixed(1),
          )
        : 0;
  } catch {
    // no-op fallback for environments without reviews table
  }

  return (
    <main className="w-full flex p-8 mt-18 gap-16 justify-center">
      <div className="w-1/2 flex flex-col p-2 gap-6">
        <Link
          href="/gigs"
          className="w-fit flex items-center gap-2 text-sm text-primary-light hover:text-primary-light/80 font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gigs
        </Link>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-dark/60">
          <span>{gig.categories?.name || ""}</span>
          <span>&gt;</span>
          <span className="text-primary-light">{subcategory}</span>
        </div>
        {/* {transformedGig.durationPosted} */}
        <h2 className={`${poppins.className} text-4xl font-bold`}>
          {gig.title}
        </h2>
        <div>
          <span
            className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
              isAvailable
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isAvailable ? "Available" : "Taken"}
          </span>
        </div>
        <div className="w-full py-4 border-y border-primary-dark/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img className="rounded-full size-14" src={transformedGig.image} />
            <div className="flex flex-col">
              <h3 className="text-lg font-bold capitalize flex items-center gap-1">
                {transformedGig.gigger}
                {gig.users?.campus_verified && (
                  <BadgeCheck className="size-5 text-primary-light" />
                )}
              </h3>
              <div className="italic text-primary-dark/50 font-light">
                3yrs experience
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <StarIcon className="text-primary-light fill-primary-light size-4" />
            <span className="font-bold">{rating || "New"}</span>
            <span className="text-primary-dark/70">
              ({reviewCount} reviews)
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className={`font-semibold text-lg ${poppins.className}`}>
            About this Gig
          </h3>
          <p className="text-primary-dark/70 leading-relaxed">
            {gig.description}
          </p>
          <p className="text-primary-dark/70 leading-relaxed">
            This service is offered by a verified campus peer. All sessions can
            be scheduled at your convenience. Feel free to reach out with any
            questions before booking.
          </p>
        </div>
        {Array.isArray(portfolios) && portfolios.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className={`font-semibold text-lg ${poppins.className}`}>
              Portfolio
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {portfolios.map((item, index: number) => {
                const { data } = supabase.storage
                  .from("GigPortfolio")
                  .getPublicUrl(item.file_path);

                return (
                  <a
                    key={item.id || index}
                    href={data.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-28 overflow-hidden rounded-lg border bg-white"
                  >
                    <img
                      src={data.publicUrl}
                      alt={item.file_name || `Portfolio ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </a>
                );
              })}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h3 className={`font-semibold text-lg ${poppins.className}`}>
            Recent Reviews
          </h3>
          {latestReviews.length === 0 ? (
            <p className="text-primary-dark/60 text-sm">No reviews yet.</p>
          ) : (
            latestReviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="rounded-lg border p-3 bg-white">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">
                    {review.reviewer?.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-primary-dark/60">
                    {review.rating}/5
                  </p>
                </div>
                <p className="text-sm text-primary-dark/70 mt-1">
                  {review.comment || "No written comment."}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className={`font-semibold text-lg ${poppins.className}`}>
            Location
          </h3>
          <div className="w-full h-120 rounded-xl bg-white flex flex-col gap-2 p-4">
            <h4 className={`${poppins.className} flex items-center gap-2`}>
              <MapPin className="size-5 text-primary-light" />
              {gig.location}
            </h4>
            <iframe
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=37.08857%2C-1.04276%2C37.09392%2C-1.03951&layer=mapnik&marker=-1.041136%2C37.091249"
            ></iframe>
          </div>
        </div>
      </div>
      <div className="w-90 h-fit bg-white rounded-lg ml-12 flex flex-col gap-4 sticky top-20 p-6">
        <div className="w-full justify-between items-center flex">
          <DollarSign className="text-primary-dark/70 size-6" />
          <div className="font-bold text-2xl">
            {formattedPrice}
            <span className="text-sm text-primary-dark/70">/{gig.per}</span>
          </div>
        </div>
        <BookButton
          gigId={id}
          title={gig.title}
          price={gig.price}
          cover={coverUrl}
          isAvailable={isAvailable}
        />
        <Link
          href={`/chat/${gig.posted_by}`}
          className="w-full py-2 bg-primary-light/20 rounded-lg text-lg font-bold flex items-center justify-center gap-2"
        >
          <MessageCircleMore />
          Chat with {transformedGig.gigger}
        </Link>
      </div>
    </main>
  );
}

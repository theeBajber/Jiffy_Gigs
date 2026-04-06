import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Star,
  MessageCircle,
  Grid3x3,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

type PageProps = {
  params: { id: string };
};

export default async function PublicProfile({ params }: PageProps) {
  const supabase = await createServerSupabaseClient();

  // Fetch public profile data
  const { data: profile } = await supabase
    .from("users")
    .select("id, name, institution, profile_pic, campus_verified, created_at")
    .eq("id", params.id)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch user's active gigs
  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, title, price, per, cover, categories(name)")
    .eq("posted_by", params.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Calculate stats
  const { count: totalGigs } = await supabase
    .from("gigs")
    .select("*", { count: "exact", head: true })
    .eq("posted_by", params.id);

  return (
    <div className="min-h-screen bg-background-light p-6">
      {/* Back Button */}
      <Link
        href="/gigs"
        className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary-dark font-semibold mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gigs
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-light to-primary-dark" />

        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white">
                {profile.profile_pic ? (
                  <Image
                    src={profile.profile_pic}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              {profile.campus_verified && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-primary-dark rounded-full p-1">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <Link
              href={`/chat?with=${profile.id}`}
              className="flex items-center gap-2 bg-primary-light text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              <MessageCircle size={20} />
              Message
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {profile.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              {profile.institution && (
                <span className="flex items-center gap-1">
                  <GraduationCap size={16} className="text-primary-light" />
                  {profile.institution}
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin size={16} className="text-primary-light" />
                On Campus
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={16} className="text-primary-light" />
                {totalGigs || 0} Gigs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gigs Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Grid3x3 className="text-primary-light" />
          Active Gigs
        </h2>

        {gigs && gigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig: any) => (
              <Link
                key={gig.id}
                href={`/gigs/${gig.id}`}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-video relative bg-slate-100">
                  {gig.cover ? (
                    <Image
                      src={gig.cover}
                      alt={gig.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Grid3x3 className="text-slate-400" size={32} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">
                    {gig.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-light font-bold">
                      KSh {gig.price}/{gig.per}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {gig.categories?.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No active gigs from this user</p>
          </div>
        )}
      </div>
    </div>
  );
}

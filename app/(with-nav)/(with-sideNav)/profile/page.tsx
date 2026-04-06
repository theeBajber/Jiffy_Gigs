"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bolt,
  MapPin,
  Briefcase,
  Star,
  MessageCircle,
  UserSearch,
  Grid3x3,
  ArrowRight,
  Loader2,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/authcontext";
import { supabase } from "@/lib/supabase";

type Gig = {
  id: string;
  title: string;
  price: number;
  per: string;
  cover: string | null;
  categories: { name: string } | null;
};

function getStorageUrl(bucket: string, path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export default function MyProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("past-work");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [stats, setStats] = useState({
    totalGigs: 0,
    completedGigs: 0,
    rating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userData) {
        setProfile({
          ...userData,
          profile_pic: getStorageUrl("Avatars", userData.profile_pic),
        });
      }

      const { data: gigsData } = await supabase
        .from("gigs")
        .select("id, title, price, per, cover, categories(name)")
        .eq("posted_by", user.id)
        .order("created_at", { ascending: false });

      if (gigsData) {
        const typedGigs: Gig[] = gigsData.map((gig: any) => ({
          id: gig.id,
          title: gig.title,
          price: gig.price,
          per: gig.per,
          cover: getStorageUrl("GigCovers", gig.cover),
          categories: gig.categories?.[0] || null,
        }));
        setGigs(typedGigs);
      }

      const { count: totalCount } = await supabase
        .from("gigs")
        .select("*", { count: "exact", head: true })
        .eq("posted_by", user.id);

      const { count: completedCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("gig_id", user.id)
        .eq("status", "completed");

      setStats({
        totalGigs: totalCount || 0,
        completedGigs: completedCount || 0,
        rating: 4.9,
        reviewCount: 12,
      });

      setLoading(false);
    }

    loadProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-light" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="flex h-[85vh] flex-col gap-6 overflow-y-scroll p-6">
      {/* Hero Header */}
      <header className="rounded-2xl bg-linear-to-br from-primary-dark to-primary-light p-6 md:p-10 text-white">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white/20 shadow-xl md:h-40 md:w-40">
              {profile.profile_pic ? (
                <Image
                  alt={profile.name}
                  src={profile.profile_pic}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/10 text-4xl font-bold">
                  {profile.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <span className="mt-2 inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Online
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex flex-col items-center gap-2 md:flex-row">
              <h1 className="text-3xl font-black md:text-4xl capitalize">
                {profile.name}
              </h1>
              {profile.campus_verified && (
                <svg
                  className="h-6 w-6 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="mb-4 text-lg font-medium text-blue-100">
              {profile.institution || "Student"}
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                <MapPin size={14} />
                On Campus
              </span>
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                <Briefcase size={14} />
                {stats.totalGigs} Active Gigs
              </span>
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm">
                <Star size={14} className="text-yellow-400" />
                {stats.rating} ({stats.reviewCount})
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/settings"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary-dark shadow-lg transition-colors hover:bg-slate-50"
              >
                <Edit3 size={18} />
                Edit Profile
              </Link>
              <Link
                href="/chat"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <MessageCircle size={18} />
                Messages
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid flex-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* About */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <UserSearch className="text-primary-light" size={24} />
              About Me
            </h3>
            <p className="mb-4 text-slate-600">
              Hey there! I&apos;m {profile.name}, a student at{" "}
              {profile.institution || "your campus"}. Check out my gigs below!
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Member Since</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="truncate font-medium max-w-35">
                  {profile.email}
                </span>
              </div>
              {profile.campus_verified && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Campus</span>
                  <span className="font-medium text-green-600">Verified</span>
                </div>
              )}
            </div>
          </section>

          {/* Expertise */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Bolt className="text-primary-light" size={24} />
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {["UI/UX", "Web Dev", "Tutoring", "Design", "Writing"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                ),
              )}
            </div>
          </section>

          {/* Stats */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-primary-light">
                  {stats.completedGigs}
                </p>
                <p className="text-xs uppercase text-slate-500">Completed</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-primary-light">
                  {stats.totalGigs}
                </p>
                <p className="text-xs uppercase text-slate-500">Active</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            {[
              { id: "past-work", label: "My Gigs", icon: Grid3x3 },
              { id: "reviews", label: "Reviews", icon: Star },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary-light text-primary-light"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "past-work" && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Active Gigs</h3>
                  <Link
                    href="/post-gig"
                    className="flex items-center gap-1 text-sm font-bold text-primary-light hover:underline"
                  >
                    Post New <ArrowRight size={16} />
                  </Link>
                </div>

                {gigs.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-slate-500">No gigs posted yet</p>
                    <Link
                      href="/post-gig"
                      className="mt-4 inline-block font-bold text-primary-light hover:underline"
                    >
                      Post your first gig
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {gigs.map((gig) => (
                      <Link
                        key={gig.id}
                        href={`/gigs/${gig.id}`}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="aspect-video bg-slate-100">
                          {gig.cover ? (
                            <Image
                              alt={gig.title}
                              src={gig.cover}
                              width={400}
                              height={225}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                              <Grid3x3 className="h-12 w-12 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="mb-2 flex items-start justify-between">
                            <h4 className="font-bold text-slate-900 line-clamp-1">
                              {gig.title}
                            </h4>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">
                              KSh {gig.price}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {gig.categories?.name || "Service"}
                            </span>
                            <ExternalLink
                              size={16}
                              className="text-slate-400"
                            />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Student Reviews</h3>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{stats.rating}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {[
                    {
                      name: "Marcus T.",
                      role: "Business Major",
                      time: "2 days ago",
                      text: "Great work! Delivered exactly what I needed.",
                      rating: 5,
                    },
                    {
                      name: "Sarah J.",
                      role: "Comp Sci",
                      time: "1 week ago",
                      text: "Very professional and quick turnaround!",
                      rating: 5,
                    },
                  ].map((review, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light font-bold text-white">
                          {review.name[0]}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-bold">{review.name}</h5>
                          <p className="text-xs text-slate-500">
                            {review.role} • {review.time}
                          </p>
                        </div>
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 italic">{review.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

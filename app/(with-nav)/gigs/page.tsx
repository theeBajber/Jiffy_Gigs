"use client";
import { GigCard } from "@/app/ui/cards";
import { poppins } from "@/app/ui/fonts";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories } from "@/app/constants/categories";
import { transformGigData } from "@/app/hooks/transformGigs";

interface TransformedGig {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  price: number;
  durationPosted: string;
  tags: string[];
  giggerAvatar: string;
  gigger: string;
  charges: string;
  image: string;
  proximity: string;
  isAvailable: boolean;
}

export default function Gigs() {
  return (
    <main className="p-4">
      <Hero />
      <GigCards />
    </main>
  );
}

function Hero() {
  return (
    <section className="w-full h-180 bg-linear-to-br to-primary-dark from-primary-light rounded-xl flex items-center p-8 text-secondary">
      <div className="w-1/2 pl-8">
        <h1
          className={`text-5xl leading-16 max-w-100 text-neutral-light font-extrabold ${poppins.className}`}
        >
          Browse, Book and Get It Done
        </h1>
      </div>
      <div className="w-1/2 flex items-center">
        <img
          src="/portraits/person1.jpg"
          className="w-3/10 rounded-xl -mr-8 z-2"
        />
        <img src="/portraits/person2.jpg" className="w-2/5 rounded-xl z-5" />
        <img
          src="/portraits/person4.jpg"
          className="w-3/10 rounded-xl -ml-8 z-2"
        />
      </div>
    </section>
  );
}
function GigCards() {
  const [gigs, setGigs] = useState<TransformedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const response = await fetch("/api/gigs", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to fetch gigs");
        }

        const safeData = Array.isArray(data) ? data : [];
        const transformedGigs = safeData.map(transformGigData);
        setGigs(transformedGigs);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch gigs";
        setFetchError(message);
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const [minPrice, setMinPrice] = useState(0);
  const [maxSelectedPrice, setMaxSelectedPrice] = useState(5000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("Anytime");
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryKeywordMap: Record<string, string[]> = {
    "Design & Creative": ["design", "creative", "graphics", "branding"],
    "Tutoring & Academic": ["tutoring", "academic", "assignment", "essay", "math"],
    "Programming & Tech": ["programming", "tech", "coding", "software", "website"],
    "Personal Care & Grooming": ["care", "grooming", "hair", "beauty", "lifestyle"],
    "Events & Photography": ["events", "photography", "photo", "video"],
  };

  const maxPrice = useMemo(() => {
    const highest = gigs.reduce((max, gig) => Math.max(max, gig.price || 0), 0);
    if (highest <= 0) return 5000;
    const rounded = Math.ceil(highest / 100) * 100;
    return Math.max(500, rounded);
  }, [gigs]);

  useEffect(() => {
    setMinPrice(0);
    setMaxSelectedPrice(maxPrice);
  }, [maxPrice]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const categorySearchBlob = [gig.category, gig.title, gig.description]
        .join(" ")
        .toLowerCase();

      const byCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((selectedCategory) => {
          const keywords = categoryKeywordMap[selectedCategory] || [selectedCategory];
          return keywords.some((keyword) =>
            categorySearchBlob.includes(keyword.toLowerCase()),
          );
        });

  const byPrice = gig.price >= minPrice && gig.price <= maxSelectedPrice;

      const byLocation =
        !location.trim() ||
        gig.proximity.toLowerCase().includes(location.trim().toLowerCase());

      const ageHours =
        (Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60);

      const byDeadline =
        deadline === "Anytime"
          ? true
          : deadline === "Within 24 hours"
            ? ageHours <= 24
            : deadline === "Within 3 days"
              ? ageHours <= 72
              : ageHours <= 24 * 7;

      const bySearch =
        !searchQuery.trim() ||
        [gig.title, gig.description, ...(gig.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());

      return byCategory && byPrice && byLocation && byDeadline && bySearch;
    });
  }, [
    gigs,
    selectedCategories,
    minPrice,
    maxSelectedPrice,
    location,
    deadline,
    searchQuery,
  ]);

  return (
    <section className="w-full flex p-4 gap-4">
      <aside className="flex flex-col gap-8 lg:col-span-1 py-4 h-fit sticky top-18">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Categories
          </h3>
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 rounded-lg hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="rounded border-slate-300 text-primary accent-primary-light focus:ring-primary"
                />
                <span className="text-sm font-medium text-slate-700">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Price Range
          </h3>
          <div className="flex flex-col gap-2 px-2">
            <div className="relative h-8">
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="100"
                value={minPrice}
                onChange={(e) => {
                  const nextMin = Number(e.target.value);
                  setMinPrice(Math.min(nextMin, maxSelectedPrice));
                }}
                className="absolute inset-0 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary-light"
              />
              <input
                type="range"
                min="0"
                max={maxPrice}
                step="100"
                value={maxSelectedPrice}
                onChange={(e) => {
                  const nextMax = Number(e.target.value);
                  setMaxSelectedPrice(Math.max(nextMax, minPrice));
                }}
                className="absolute inset-0 h-2 w-full cursor-pointer appearance-none rounded-lg bg-transparent accent-primary-dark"
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>KSh {minPrice}</span>
              <span>KSh {maxSelectedPrice}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Deadline
          </h3>
          <div className="relative">
            <select
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full accent-primary-light appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm focus:border-primary focus:ring-primary"
            >
              <option>Anytime</option>
              <option>Within 24 hours</option>
              <option>Within 3 days</option>
              <option>This week</option>
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Location
          </h3>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Main Campus, Library..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
        <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600 font-medium">
          Showing {filteredGigs.length} of {gigs.length} gigs
        </div>
      </aside>
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="rounded-3xl w-[70%] h-12 border p-4 flex items-center gap-2">
          <Search />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search for skills, tasks, services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full grid grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading gigs...
            </div>
          ) : fetchError ? (
            <div className="col-span-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              Could not load gigs: {fetchError}
            </div>
          ) : filteredGigs.length === 0 ? (
            <div className="col-span-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No gigs found. Try clearing filters or adjusting your search.
            </div>
          ) : (
            filteredGigs.map((gig) => <GigCard key={gig.id} {...gig} />)
          )}
        </div>
      </div>
    </section>
  );
}

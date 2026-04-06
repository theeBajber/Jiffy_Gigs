"use client";
import { GigCard } from "@/app/ui/cards";
import { poppins } from "@/app/ui/fonts";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { categories } from "@/app/constants/categories";
import { transformGigData } from "@/app/hooks/transformGigs";

interface TransformedGig {
  id: string;
  title: string;
  description: string;
  category: string;
  durationPosted: string;
  tags: string[];
  giggerAvatar: string;
  gigger: string;
  charges: string;
  image: string;
  proximity: string;
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
  useEffect(() => {
    const fetchGigs = async () => {
      const response = await fetch("/api/gigs");
      const data = await response.json();
      const transformedGigs = data.map(transformGigData);
      setGigs(transformedGigs);
    };
    fetchGigs();
  }, []);
  const [priceRange, setPriceRange] = useState(50);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Tutoring & Academic",
  ]);
  const [deadline, setDeadline] = useState("Anytime");
  const [location, setLocation] = useState("");

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleApplyFilters = () => {
    console.log({
      selectedCategories,
      priceRange,
      deadline,
      location,
    });
  };
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
            <input
              type="range"
              min="5"
              max="500"
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-primary-dark [&::-webkit-slider-thumb]:bg-primary-light [&::-moz-range-thumb]:bg-primary-light [&::-moz-range-thumb]:rounded-full"
            />
            <div className="flex justify-between text-xs font-semibold text-slate-500">
              <span>$5</span>
              <span>${priceRange}</span>
              <span>$500+</span>
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
        <button
          onClick={handleApplyFilters}
          className="rounded-xl bg-primary-light py-3 font-bold text-white transition-opacity hover:opacity-90"
        >
          Apply Filters
        </button>
      </aside>
      <div className="w-full flex flex-col gap-4 p-4">
        <div className="rounded-3xl w-[70%] h-12 border p-4 flex items-center gap-2">
          <Search />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search for skills, tasks, services..."
          />
        </div>
        <div className="w-full grid grid-cols-3 gap-4">
          {gigs.map((gig) => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
      </div>
    </section>
  );
}

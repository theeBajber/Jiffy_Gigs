"use client";

import { ArrowRight, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const popularSkills = [
  "Web Design",
  "Hair Styling",
  "Interior design",
  "Fitness Training",
];

export default function HomeSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const goToGigs = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      router.push("/gigs");
      return;
    }

    router.push(`/gigs?search=${encodeURIComponent(trimmed)}`);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToGigs(query);
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="bg-neutral-light rounded-4xl h-12 w-full flex items-center justify-between px-2 text-primary-dark"
      >
        <Search />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-[85%] outline-none"
          placeholder="Search for skills..."
          aria-label="Search gigs"
        />
        <button
          type="submit"
          className="bg-primary-light aspect-square h-[85%] rounded-full text-neutral-light flex items-center justify-center"
          aria-label="Search"
        >
          <ArrowRight />
        </button>
      </form>

      <div className="flex items-center gap-2 text-primary-dark">
        <span className="text-secondary">{`Popular skills: `}</span>
        {popularSkills.map((skill) => (
          <button
            key={skill}
            type="button"
            onClick={() => goToGigs(skill)}
            className="rounded-2xl bg-secondary p-1 px-2 text-sm"
          >
            {skill}
          </button>
        ))}
      </div>
    </>
  );
}

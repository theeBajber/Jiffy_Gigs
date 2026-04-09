"use client";
import { usePathname } from "next/navigation";
import UseScrollDirection from "../hooks/useScrollDirection";
import { poppins } from "./fonts";
import {
  Bell,
  CircleUser,
  House,
  MessageCircle,
  NotebookPen,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { logout } from "../hooks/auth";

export function TopNav({ user }: { user: { id?: string } | null }) {
  const { isVisible, isAtTop } = UseScrollDirection();
  const pathName = usePathname();
  const heroRoutes = ["/", "/gigs", "/legal", "/privacy"];
  const hasHero = heroRoutes.includes(pathName || "");

  return (
    <nav
      className={`
        fixed  left-1/2 -translate-x-1/2 h-18
        flex items-center justify-between z-50
        text-secondary
        transition-all duration-500 ease-in-out
        ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
        ${isAtTop && hasHero ? "w-[95%] p-1 top-4 bg-transparent!" : "top-0 w-full px-8 bg-linear-to-br to-primary-dark from-primary-light"}
      `}
    >
      <Link href="/" className="h-[75%] flex items-center gap-2">
        <div className="h-full bg-neutral-light/20 aspect-square rounded-full flex items-center justify-center">
          <img src={"/logo.png"} className="h-[85%]" alt="Jiffy Gigs logo" />
        </div>
        <h1 className={`text-2xl font-bold uppercase ${poppins.className}`}>
          JiffyGigs
        </h1>
      </Link>
      <div className="flex gap-4">
        <Link href="/gigs" className="font-semibold text-lg">
          Browse Gigs
        </Link>
        <Link href="/post-gig" className="font-semibold text-lg">
          Post a Gig
        </Link>
        <Link href="/dashboard" className="font-semibold text-lg">
          Dashboard
        </Link>
      </div>
      {!user ? (
        <div className="flex gap-2">
          <Link
            href="/login"
            className="py-1 px-4 rounded-3xl border-neutral-light border"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="py-1 px-4 rounded-3xl bg-neutral-light border text-primary-dark"
          >
            Register
          </Link>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            className="py-1 px-4 rounded-3xl border-neutral-light border"
            onClick={() => logout()}
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
}

export function SideNav() {
  const [isBell] = useState(true);
  return (
    <aside className="w-20 p-4 m-4 rounded-full h-[85vh] bg-linear-to-br to-primary-dark from-primary-light flex flex-col items-center justify-between text-secondary sticky top-20">
      <div className="flex flex-col items-center gap-6 w-full">
        <Link
          href="/notifications"
          className="border-b w-full items-center flex justify-center py-6"
          title="Notifications"
        >
          <Bell className="w-8 h-8" fill={`${isBell ? "#d1d5db" : "none"}`} />
        </Link>
        <div className="flex flex-col items-center w-full gap-6">
          <Link href={"/dashboard"} title="Dashboard">
            <House className="w-8 h-8" />
          </Link>
          <Link href={"/chat"} title="Dashboard">
            <MessageCircle className="w-8 h-8" />
          </Link>
          <Link href={"/bookings"} title="Bookings">
            <NotebookPen className="w-8 h-8" />
          </Link>
          <Link href={"/settings"} title="Settings">
            <Settings2 className="w-8 h-8" />
          </Link>
        </div>
      </div>
      <Link href={"/profile"} className="border-t py-6" title="Profile">
        <CircleUser className="w-8 h-8" />
      </Link>
    </aside>
  );
}

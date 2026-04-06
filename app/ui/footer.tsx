import { Facebook, Instagram, Linkedin, Twitch } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-primary-dark flex flex-col p-6 text-secondary">
      <div className="flex w-full border-b justify-between p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-neutral-light rounded-full">
              <img src="/logo.png" className="h-10" />
            </div>
            <h1 className="text-neutral-light text-2xl font-extrabold">
              Jiffy Gigs
            </h1>
          </div>
          <p className="max-w-105">
            A platform for finding and offering micro-jobs within university
            communities.
          </p>
          <div className="flex items-center gap-2 text-neutral-dark">
            <a href="" className="rounded-full bg-neutral-light p-1.5">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="" className="rounded-full bg-neutral-light p-1.5">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="" className="rounded-full bg-neutral-light p-1.5">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="" className="rounded-full bg-neutral-light p-1.5">
              <Twitch className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2 pr-4">
          <h3 className="text-xl font-bold text-neutral-light mb-1">Hustle</h3>
          <a href="/" className="">
            Home
          </a>
          <a href="/gigs" className="">
            Browse Gigs
          </a>
          <a href="/post-gig" className="">
            Post a Gig
          </a>
          <a href="how-it-works" className="">
            How It Works
          </a>
        </div>
      </div>
      <div className="flex justify-between p-4">
        <div className="">&copy; 2026 Jiffy Gigs</div>
        <div className="flex items-center gap-4 pr-4">
          <a href="/legal" className="">
            Legal
          </a>
          <a href="/support" className="">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}

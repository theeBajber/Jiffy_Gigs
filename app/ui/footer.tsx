import { Facebook, Instagram, Linkedin, Twitch } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-primary-dark text-secondary">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6 md:p-8">
        <div className="flex flex-col justify-between gap-8 border-b border-neutral-light/20 pb-6 md:flex-row">
          <div className="flex max-w-md flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-neutral-light p-1">
                <Image
                  src="/logo.png"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                  alt="Jiffy Gigs logo"
                />
              </div>
              <h1 className="text-2xl font-extrabold text-neutral-light">
                Jiffy Gigs
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Find and offer trusted micro-jobs within your university
              community.
            </p>
            <div className="flex items-center gap-2 text-neutral-dark">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full bg-neutral-light p-1.5"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="rounded-full bg-neutral-light p-1.5"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="rounded-full bg-neutral-light p-1.5"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitch.tv"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitch"
                className="rounded-full bg-neutral-light p-1.5"
              >
                <Twitch className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-2 pr-4">
              <h3 className="mb-1 text-lg font-bold text-neutral-light">Explore</h3>
              <Link href="/" className="hover:text-neutral-light">
                Home
              </Link>
              <Link href="/gigs" className="hover:text-neutral-light">
                Browse Gigs
              </Link>
              <Link href="/post-gig" className="hover:text-neutral-light">
                Post a Gig
              </Link>
              <Link href="/how-it-works" className="hover:text-neutral-light">
                How It Works
              </Link>
            </div>

            <div className="flex flex-col gap-2 pr-4">
              <h3 className="mb-1 text-lg font-bold text-neutral-light">Company</h3>
              <Link href="/legal" className="hover:text-neutral-light">
                Legal
              </Link>
              <Link href="/privacy" className="hover:text-neutral-light">
                Privacy
              </Link>
              <Link href="/support" className="hover:text-neutral-light">
                Support
              </Link>
            </div>

            <div className="flex flex-col gap-2 pr-4">
              <h3 className="mb-1 text-lg font-bold text-neutral-light">Contact</h3>
              <a href="mailto:support@jiffygigs.com" className="hover:text-neutral-light">
                support@jiffygigs.com
              </a>
              <span>Nairobi, Kenya</span>
              <span>Mon - Sat, 8am - 8pm</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-2 text-sm md:flex-row">
          <div>&copy; {year} Jiffy Gigs. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="hover:text-neutral-light">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-neutral-light">
              Privacy
            </Link>
            <Link href="/support" className="hover:text-neutral-light">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

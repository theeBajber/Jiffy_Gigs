import { ArrowLeft, ArrowRight, Clipboard, Quote } from "lucide-react";
import { CurrencyDollarIcon, StarIcon } from "@heroicons/react/16/solid";
import { poppins } from "../ui/fonts";
import { ReasonCard } from "../ui/cards";
import Link from "next/link";
import Image from "next/image";
import HomeSearch from "../ui/homeSearch";
import { createServerSupabaseClient } from "@/lib/supabase-server";

type HomeGig = {
  id: string;
  title: string;
  price: number;
  per: string;
  cover: string | null;
  bookings?: { status?: string; payment_status?: string }[];
  categories?: { name: string } | { name: string }[] | null;
};

export default function Home() {
  return (
    <main className="p-4">
      <Hero />
      <Services />
      <Why />
    </main>
  );
}
function Hero() {
  return (
    <section className="w-full h-180 bg-linear-to-br to-primary-dark from-primary-light rounded-xl relative flex flex-col items-center p-8 mb-12">
      <Image
        src="/about.jpg"
        alt="Freelancer at work"
        width={560}
        height={560}
        className="absolute -bottom-20 right-0 w-auto h-auto"
      />
      <div className="w-56 h-44 absolute rounded-2xl backdrop-blur-lg bg-secondary/30 right-24 bottom-30 flex flex-col gap-2 items-center p-4">
        <div className="flex items-center gap-2 border-b pb-1.5 w-full">
          <Image
            src="/portraits/person6.jpg"
            alt="Jenny profile"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full"
          />
          <div className="flex flex-col">
            <div className="text-primary-dark/80">@jenny</div>
            <div className="text-primary-dark">Ui/Ux Designer</div>
          </div>
        </div>
        <div className="flex items-center w-full gap-2">
          <div className="p-2 rounded-full bg-primary-light text-secondary">
            <Clipboard className="h-5 w-5" />
          </div>
          <div className="text-primary-dark">
            <span className="font-semibold">5</span>6{" "}
            <span className="text-primary-dark/80">Done Gigs</span>
          </div>
        </div>
        <div className="flex items-center w-full gap-2">
          <div className="p-2 rounded-full bg-primary-light text-secondary">
            <CurrencyDollarIcon className="h-5 w-5" />
          </div>
          <div className="text-primary-dark">
            <span className="font-semibold">$30</span>{" "}
            <span className="text-primary-dark/80">per hour</span>
          </div>
        </div>
      </div>
      <h1
        className={`md:text-[14rem] text-[6rem] sm:text[8rem] font-extrabold tracking-widest text-neutral-light ${poppins.className}`}
      >
        HUSTLE
      </h1>
      <div className="absolute left-8 bottom-8 flex flex-col w-1/2 h-90 p-8 gap-4 text-secondary">
        <HomeSearch />
        <p className="">
          Quick gigs, fast cash.
          <br />A platform for finding and offering micro-jobs within university
          communities.
        </p>
        <div className=" w-[90%] bg-secondary/30 backdrop-blur-sm h-30 rounded-2xl p-4 flex justify-between">
          <div className="flex flex-col justify-between">
            <h4 className="text-primary-dark font-bold text-lg">
              Trusted Gigsters
            </h4>
            <div className="flex items-center ">
              <Image
                src="/portraits/person1.jpg"
                alt="Gigster profile 1"
                width={48}
                height={48}
                className="rounded-full h-12 w-12"
              />
              <Image
                src="/portraits/person2.jpg"
                alt="Gigster profile 2"
                width={48}
                height={48}
                className="rounded-full h-12 w-12 -ml-4"
              />
              <Image
                src="/portraits/person3.jpg"
                alt="Gigster profile 3"
                width={48}
                height={48}
                className="rounded-full h-12 w-12 -ml-4"
              />
              <Image
                src="/portraits/person4.jpg"
                alt="Gigster profile 4"
                width={48}
                height={48}
                className="rounded-full h-12 w-12 -ml-4"
              />
              <Image
                src="/portraits/person5.jpg"
                alt="Gigster profile 5"
                width={48}
                height={48}
                className="rounded-full h-12 w-12 -ml-4"
              />
              <Image
                src="/portraits/person6.jpg"
                alt="Gigster profile 6"
                width={48}
                height={48}
                className="rounded-full h-12 w-12 -ml-4"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-0.5 text-accent">
              <StarIcon className="h-5" />
              <StarIcon className="h-5" />
              <StarIcon className="h-5" />
              <StarIcon className="h-5" />
              <StarIcon className="h-5" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-primary-dark font-bold text-lg">200+</h4>
              <div className="text-primary-dark/90">Satisfied customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function Services() {
  const supabase = await createServerSupabaseClient();
  const { data: gigs } = await supabase
    .from("gigs")
    .select("id, title, price, per, cover, categories(name), bookings(status, payment_status)")
    .order("created_at", { ascending: false })
    .limit(4);

  const formattedGigs = ((gigs || []) as HomeGig[]).map((gig) => {
    const {
      data: { publicUrl },
    } = gig.cover
      ? supabase.storage.from("GigCovers").getPublicUrl(gig.cover)
      : { data: { publicUrl: "/gigs/design.jpg" } };

    return {
      id: gig.id,
      title: gig.title,
      category: Array.isArray(gig.categories)
        ? gig.categories[0]?.name
        : gig.categories?.name,
      price: gig.price,
      per: gig.per,
      image: publicUrl,
      isAvailable: !(gig.bookings || []).some(
        (booking) =>
          booking?.status === "pending" ||
          booking?.status === "active" ||
          booking?.payment_status === "paid" ||
          booking?.payment_status === "completed",
      ),
    };
  });

  return (
    <section className="w-full flex flex-col p-8 gap-8 text-primary-dark">
      <div className="w-full flex justify-between items-center">
        <div className="flex flex-col gap-4">
          <h2
            className={`text-4xl font-extrabold uppercase ${poppins.className}`}
          >
            Popular Gigs
          </h2>
          <p className="max-w-102">
            Quick tasks, fair pay—from tutoring to tech help, all by trusted
            campus peers.
          </p>
        </div>
        <Link
          href="/gigs"
          className="text-xl text-primary-dark font-semibold flex items-center gap-2 border-b"
        >
          View All
          <ArrowRight />
        </Link>
      </div>
      <div className="w-full rounded-2xl border overflow-hidden">
        {formattedGigs.length === 0 ? (
          <div className="p-8 text-center text-primary-dark/70">
            No gigs available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {formattedGigs.map((gig) => (
              <Link
                key={gig.id}
                href={`/gigs/${gig.id}`}
                className="group flex items-center border-b last:border-b-0 md:nth-last-[-n+2]:border-b-0 md:border-r md:nth-[2n]:border-r-0"
              >
                <div className="relative w-1/2 h-52 overflow-hidden bg-slate-100">
                  <Image
                    src={gig.image}
                    alt={gig.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="w-1/2 p-4 flex flex-col gap-2">
                  <span className="text-xs uppercase font-semibold text-primary-dark/60">
                    {gig.category || "General"}
                  </span>
                  <span
                    className={`w-fit text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${
                      gig.isAvailable
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {gig.isAvailable ? "Available" : "Taken"}
                  </span>
                  <h3 className="text-lg font-bold leading-snug line-clamp-2">
                    {gig.title}
                  </h3>
                  <p className="text-primary-light font-semibold">
                    KSh {gig.price}/{gig.per}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Why() {
  return (
    <section className="w-full flex flex-col p-8">
      <div className="flex flex-col items-center gap-2 w-full">
        <h2
          className={`text-4xl font-extrabold uppercase ${poppins.className}`}
        >
          Why Choose Us?
        </h2>
        <p className="max-w-140 text-center">
          Choose us for unmatched quality, exceptional service and a commitment
          to exceeding your expectations every time.
        </p>
      </div>
      <div className="w-full flex items-center justify-between">
        <Image
          src="/choose.png"
          alt="People collaborating"
          width={640}
          height={480}
          className="h-120 w-auto -mb-14"
        />
        <div className="flex flex-col w-1/2 gap-4 items-end overflow-visible">
          <ReasonCard
            className=""
            icon="zap"
            title="Flexibility"
            text="Work on your terms. Post or grab gigs anytime — whether it’s a 2-hour study break or a weekend project. Your schedule, your hustle."
          />
          <ReasonCard
            className="mr-16 bg-primary-light text-neutral-light!"
            icon="shield"
            title="Secure And Reliable"
            text="Verified peers, safe transactions, and no shady middlemen. Trust is built in, so you can focus on getting things done."
          />
          <ReasonCard
            className=""
            icon="buoy"
            title="Support And Community"
            text="Built by students, for students. Get help, share skills, and grow with a campus network that’s got your back — no corporate BS."
          />
        </div>
      </div>
      <div className="w-full h-68 bg-primary-light/50 backdrop-blur-lg rounded-2xl flex items-center justify-between p-8">
        <div className="flex flex-col h-full w-2/5 gap-4 justify-center">
          <h3 className={`${poppins.className} uppercase text-4xl`}>
            Peers vouch for peers
          </h3>
          <div className="flex items-center gap-4">
            <button className="rounded-full border p-2">
              <ArrowLeft className="" />
            </button>
            <button className="rounded-full border p-2">
              <ArrowRight />
            </button>
          </div>
        </div>
        <div className="h-full w-3/5 flex flex-col gap-2">
          <div className="p-2 rounded-full bg-secondary w-fit -ml-6">
            <Quote />
          </div>
          <p className="max-w-175">
            &ldquo;JiffyGigs helped me pay for textbooks this semester. I tutored a
            few first-years in Python, and the cash came in fast—no scams, no
            stress!&rdquo;
          </p>
          <div className="flex items-center mt-2 gap-2">
            <Image
              src="/portraits/person6.jpg"
              alt="Jennifer Groot"
              width={56}
              height={56}
              className="rounded-full h-14 w-14"
            />
            <div className="flex flex-col">
              <div className="text-lg font-semibold">Jennifer Groot</div>
              <div className="text-sm text-primary-dark/80">Student, UoN</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import {
  LifeBuoy,
  ShieldCheck,
  Star,
  Zap,
  Code,
  User,
  DollarSign,
} from "lucide-react";
import { poppins } from "./fonts";
import Link from "next/link";
import Image from "next/image";

export const ReasonCard = ({
  className,
  icon,
  title,
  text,
}: {
  className: string;
  icon: string;
  title: string;
  text: string;
}) => {
  return (
    <div
      className={`w-3/4 max-w-125 h-32 rounded-xl flex items-center gap-4 p-4 text-primary-dark ${className}`}
    >
      <div
        className={`rounded-full p-3 ${icon == "shield" ? "bg-primary-dark/50" : "bg-primary-dark/20"}`}
      >
        {icon == "buoy" ? (
          <LifeBuoy className="h-8 w-8" />
        ) : icon == "shield" ? (
          <ShieldCheck className="h-8 w-8" />
        ) : (
          <Zap className="h-8 w-8" />
        )}
      </div>
      <div className="">
        <h3 className={`text-xl font-extrabold uppercase ${poppins.className}`}>
          {title}
        </h3>
        <p>{text}</p>
      </div>
    </div>
  );
};

export const GigCard = ({
  id,
  title,
  category,
  durationPosted,
  description,
  tags,
  giggerAvatar,
  gigger,
  rating,
  reviewsCount,
  charges,
  image,
  proximity,
  isAvailable = true,
}: {
  id: string;
  title: string;
  category: string;
  durationPosted: string;
  description: string;
  tags: string[];
  giggerAvatar: string;
  gigger: string;
  rating?: number;
  reviewsCount?: number;
  charges: string;
  image: string;
  proximity: string;
  isAvailable?: boolean;
}) => {
  return (
    <Link href={`/gigs/${id}`} className="block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-xl">
        <div className="relative h-40 w-full overflow-hidden bg-indigo-50">
          <Image
            alt={title}
            src={image || "/gigs/design.jpg"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover w-full opacity-80 transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-sm">
            {category}
          </span>
          <span
            className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold shadow-sm ${
              isAvailable
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {isAvailable ? "Available" : "Taken"}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 cursor-pointer text-lg font-bold leading-tight transition-colors hover:text-primary">
              {title}
            </h3>
            <span className="shrink-0 text-xl font-extrabold text-primary">
              KES {charges}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {description}
          </p>
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
          <div className="flex-1" />
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                <Image
                  alt={gigger}
                  src={giggerAvatar || "/portraits/person1.jpg"}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold">{gigger}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                  <Star size={12} className="fill-current" />
                  <span>
                    {typeof rating === "number" && typeof reviewsCount === "number"
                      ? `${rating.toFixed(1)} (${reviewsCount})`
                      : "New seller"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {durationPosted}
              </span>
              {proximity && (
                <span className="text-[10px] font-medium text-slate-400">
                  {proximity}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export function BookingCard({
  clientName,
  amount,
  title,
  id,
  status,
  cover,
  payment_status,
  per = "gig",
  isProvider = false,
  onAccept,
  onCancel,
  onMarkDone,
  onPay,
}: {
  clientName: string;
  title: string;
  amount: number;
  id: string;
  status: "pending" | "active" | "completed" | "cancelled";
  cover?: string;
  payment_status: "pending" | "paid" | "completed" | "failed";
  per?: string;
  isProvider?: boolean;
  onAccept?: () => void;
  onCancel?: () => void;
  onMarkDone?: () => void;
  onPay?: () => void;
}) {
  const isCompleted = status === "completed";
  const isPaid = ["paid", "completed"].includes(payment_status);
  const isPending = status === "pending";
  const isActive = status === "active";
  const isCancelled = status === "cancelled";
  return (
    <div className="flex w-full justify-between rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
      <Link className="flex items-start gap-4" href={`/checkout/${id}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-primary overflow-hidden">
          {cover ? (
            <Image
              src={cover}
              alt={title}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          ) : (
            <Code size={32} />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isCompleted ? "text-accent" : "text-primary-light"
              }`}
            >
              {isCompleted
                ? "Completed"
                : isPending
                  ? "Pending Acceptance"
                : isActive
                  ? "In Progress"
                  : "Cancelled"}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500"># {id.slice(0, 12)}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <User size={16} />
              <span className="capitalize">{clientName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <DollarSign size={16} />
              <span
                className={`font-semibold ${isPaid ? "text-accent" : "text-error"}`}
              >
                KSh {amount}
              </span>
              <span className="text-xs text-slate-400">/ {per}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Provider actions */}
        {isProvider && isPending && (
          <button
            onClick={onAccept}
            className="px-3 py-1.5 rounded-lg bg-primary-light text-white text-sm font-medium hover:bg-primary-light/90 transition-colors"
          >
            Accept
          </button>
        )}

        {isProvider && isActive && (
          <>
            <button
              onClick={onMarkDone}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          </>
        )}

        {!isProvider && isCompleted && !isPaid && (
          <button
            onClick={onPay}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Proceed to Checkout
          </button>
        )}

        {/* Cancel option for both (if not completed) */}
        {!isCompleted && !isCancelled && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

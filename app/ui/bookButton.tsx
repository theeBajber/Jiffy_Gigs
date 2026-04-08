"use client";

import { useState } from "react";
import BookingModal from "./bookingModal";

export default function BookButton({
  gigId,
  title,
  price,
  cover,
  isAvailable = true,
}: {
  gigId: string;
  title: string;
  price: number;
  cover?: string;
  isAvailable?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        disabled={!isAvailable}
        onClick={() => setOpen(true)}
        className={`w-full py-2 rounded-lg text-lg font-bold text-white ${
          isAvailable
            ? "bg-primary-light"
            : "bg-slate-400 cursor-not-allowed"
        }`}
      >
        {isAvailable ? "Book Service" : "Currently Taken"}
      </button>

      <BookingModal
        isOpen={open}
        onCloseAction={() => setOpen(false)}
        gigId={gigId}
        title={title}
        price={price}
        cover={cover}
      />
    </>
  );
}

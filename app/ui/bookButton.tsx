"use client";

import { useState } from "react";
import BookingModal from "./bookingModal";

export default function BookButton({
  gigId,
  title,
  price,
  cover,
}: {
  gigId: string;
  title: string;
  price: number;
  cover?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2 bg-primary-light rounded-lg text-lg font-bold text-white"
      >
        Book Service
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

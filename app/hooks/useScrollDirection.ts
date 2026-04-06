"use client";

import { useEffect, useRef, useState } from "react";

type scrollDirection = "up" | "down" | null;

export default function UseScrollDirection(threshold: number = 10) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const [scrollDirection, setScrollDirection] = useState<scrollDirection>(null);
  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY: number = window.scrollY;
      const atTop = scrollY < 50;
      setIsAtTop(atTop);
      if (atTop) {
        setIsVisible(true);
        setScrollDirection(null);
        lastScrollY.current = scrollY;
        return;
      }

      if (Math.abs(scrollY - lastScrollY.current) < threshold) {
        return;
      }

      if (scrollY > lastScrollY.current && scrollY > 100) {
        setScrollDirection("down");
        setIsVisible(false);
      } else if (scrollY < lastScrollY.current) {
        setScrollDirection("up");
        setIsVisible(true);
      }
      lastScrollY.current = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection);

    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [threshold]);
  return { scrollDirection, isVisible, isAtTop };
}

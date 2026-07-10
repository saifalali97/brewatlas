"use client";

import Link from "next/link";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";

type RippleLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

type Ripple = { id: number; x: number; y: number };

export function RippleLink({ href, className = "", children }: RippleLinkProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const ripple = {
      id,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== id));
    }, 650);
  }, []);

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative isolate overflow-hidden ${className}`}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden
          className="animate-ripple pointer-events-none absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 12,
            height: 12,
            marginLeft: -6,
            marginTop: -6,
          }}
        />
      ))}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useState, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from "react";

type RippleLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children" | "onClick">;

type Ripple = { id: number; x: number; y: number };

export function RippleLink({
  href,
  className = "",
  children,
  ...props
}: RippleLinkProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === "#") {
      event.preventDefault();
    }

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
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`relative isolate overflow-hidden ${className}`}
      {...props}
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

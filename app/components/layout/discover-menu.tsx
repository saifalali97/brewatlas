"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { dsFocus, dsMotion, dsRadius } from "@/lib/constants/styles";

type DiscoverLink = { href: string; label: string };

type DiscoverMenuProps = {
  label: string;
  menuAriaLabel: string;
  links: DiscoverLink[];
  onDark?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Desktop Discover dropdown — keyboard accessible. */
export function DiscoverMenu({ label, menuAriaLabel, links, onDark = false }: DiscoverMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerClass = onDark
    ? open
      ? "text-ba-pearl"
      : "text-ba-sand-deep/85 hover:text-ba-pearl"
    : open
      ? "text-ba-espresso"
      : "text-ac-espresso hover:text-ba-bronze";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="discover-menu-panel"
        aria-label={menuAriaLabel}
        onClick={() => setOpen((current) => !current)}
        className={joinClasses(
          "group relative inline-flex items-center gap-1 px-0.5 py-1.5 text-sm font-medium",
          dsMotion.transition,
          triggerClass,
          onDark ? dsFocus.ringDark : dsFocus.ring,
        )}
      >
        {label}
        <ChevronDown
          className={joinClasses("h-4 w-4 transition-transform duration-300", open && "rotate-180")}
          aria-hidden
        />
        <span
          className={joinClasses(
            "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-ba-gold transition-all duration-500",
            dsMotion.easing,
            open ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id="discover-menu-panel"
          role="menu"
          aria-label={menuAriaLabel}
          className={joinClasses(
            "absolute start-0 top-[calc(100%+0.75rem)] z-50 min-w-[14rem]",
            dsRadius.lg,
            "border border-ba-espresso/[0.08] bg-ba-pearl/95 p-2 shadow-[0_24px_48px_-12px_rgba(28,22,18,0.14)] backdrop-blur-2xl",
          )}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={joinClasses(
                "flex min-h-10 items-center rounded-lg px-3 py-2 text-sm text-ac-espresso",
                dsMotion.transition,
                "hover:bg-ba-sand/50 hover:text-ba-espresso",
                dsFocus.ring,
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

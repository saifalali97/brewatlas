"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedStatProps = {
  value: string;
  label: string;
  variant?: "light" | "dark";
};

function parseStatValue(value: string) {
  const match = value.match(/^([\d,]+)(.*)$/);
  if (!match) {
    return { target: 0, suffix: value, useComma: false };
  }

  const raw = match[1];
  return {
    target: parseInt(raw.replace(/,/g, ""), 10),
    suffix: match[2],
    useComma: raw.includes(","),
  };
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedStat({ value, label, variant = "light" }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);
  const isDark = variant === "dark";

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { target, suffix, useComma } = parseStatValue(value);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const duration = 1800;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const current = Math.floor(target * easeOutCubic(progress));
          setDisplay(`${useComma ? current.toLocaleString("en-US") : current}${suffix}`);

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        observer.unobserve(element);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <p
        className={`font-display text-3xl tracking-tight tabular-nums sm:text-4xl lg:text-[2.75rem] lg:leading-none ${
          isDark ? "text-ba-pearl" : "text-ba-espresso"
        }`}
      >
        <span className="motion-reduce:hidden">{display}</span>
        <span className="hidden motion-reduce:inline">{value}</span>
      </p>
      <p className={`mt-2.5 text-sm leading-relaxed ${isDark ? "text-ba-sand-deep/65" : "text-ac-espresso"}`}>
        {label}
      </p>
    </div>
  );
}

"use client";

import {
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useMediaQuery, usePrefersReducedMotion } from "./use-media-query";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

export function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const reducedMotion = usePrefersReducedMotion();
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const enabled = !reducedMotion && !coarsePointer;

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setTransform(
      `perspective(900px) rotateX(${y * -3.5}deg) rotateY(${x * 3.5}deg)`,
    );
  };

  const handleLeave = () => {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
      style={enabled && transform ? { transform } : undefined}
    >
      {children}
    </div>
  );
}

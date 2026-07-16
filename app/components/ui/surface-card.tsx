import type { ReactNode } from "react";
import { surfaces } from "@/lib/constants/styles";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

/** Premium elevated panel for auth and focused forms. */
export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return <div className={`${surfaces.authCard} ${className}`.trim()}>{children}</div>;
}

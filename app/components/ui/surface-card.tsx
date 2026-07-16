import type { ReactNode } from "react";
import { acSurface } from "@/lib/design-system/atlas-canon";
import { surfaces } from "@/lib/constants/styles";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

/** Premium elevated panel for auth and focused forms. */
export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <div className={`${acSurface.plate} ${surfaces.authCard} ${className}`.trim()}>{children}</div>
  );
}

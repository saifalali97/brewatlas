import { ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhSectionDividerProps = {
  className?: string;
};

/** Subtle section divider for long-form reading flow. */
export function GhSectionDivider({ className = "my-12" }: GhSectionDividerProps) {
  return <div aria-hidden className={`${ghSurfaces.divider} ${className}`} />;
}

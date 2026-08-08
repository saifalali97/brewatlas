import type { ReactNode } from "react";
import { rdTypography } from "@/lib/design-system/recipes-directory";

type DirectoryEmptyStateProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Lightweight empty copy for Recipes directory grids.
 * Distinct from Atlas `EmptyState` (plate / lifestyle photo).
 */
export function DirectoryEmptyState({
  children,
  className = "",
}: DirectoryEmptyStateProps) {
  return <p className={`${rdTypography.empty} ${className}`.trim()}>{children}</p>;
}

/** Alias matching the Recipes design-system component name. */
export { DirectoryEmptyState as EmptyState };

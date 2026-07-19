/** Editorial lifecycle for Gulf Heritage pages — maps to future CMS review workflow. */
export type GulfHeritageEditorialStatus =
  | "draft"
  | "verified"
  | "coming-soon"
  | "blocked"
  | "pending-review";

export const GULF_HERITAGE_EDITORIAL_STATUSES = [
  "draft",
  "verified",
  "coming-soon",
  "blocked",
  "pending-review",
] as const satisfies readonly GulfHeritageEditorialStatus[];

export function isGulfHeritageEditorialStatus(value: string): value is GulfHeritageEditorialStatus {
  return (GULF_HERITAGE_EDITORIAL_STATUSES as readonly string[]).includes(value);
}

/** Whether editorial body content should render from verified sources. */
export function isGulfHeritageEditorialPublished(status: GulfHeritageEditorialStatus): boolean {
  return status === "verified" || status === "pending-review";
}

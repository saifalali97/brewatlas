import type { RecipePublishIntent, RecipePublishStatus } from "@/types/recipe-publishing";

export function parsePublishIntent(value: FormDataEntryValue | null): RecipePublishIntent {
  const raw = typeof value === "string" ? value.trim() : "";
  if (
    raw === "draft" ||
    raw === "publish" ||
    raw === "unpublish" ||
    raw === "archive" ||
    raw === "restore" ||
    raw === "schedule"
  ) {
    return raw;
  }
  return "draft";
}

export function resolveStatusFromIntent(
  intent: RecipePublishIntent,
  currentStatus: RecipePublishStatus | null | undefined,
  scheduledPublishAt: string | null,
): { status: RecipePublishStatus; scheduledPublishAt: string | null } {
  if (intent === "publish") {
    return { status: "published", scheduledPublishAt: null };
  }
  if (intent === "unpublish") {
    return { status: "draft", scheduledPublishAt: null };
  }
  if (intent === "archive") {
    return { status: "archived", scheduledPublishAt: null };
  }
  if (intent === "restore") {
    return { status: "draft", scheduledPublishAt: null };
  }
  if (intent === "schedule" && scheduledPublishAt) {
    return { status: "scheduled", scheduledPublishAt };
  }
  if (currentStatus === "archived" && intent === "draft") {
    return { status: "draft", scheduledPublishAt: null };
  }
  if (currentStatus === "scheduled" && intent === "draft") {
    return { status: "draft", scheduledPublishAt: null };
  }
  return {
    status: currentStatus && currentStatus !== "published" ? currentStatus : "draft",
    scheduledPublishAt: intent === "schedule" ? scheduledPublishAt : null,
  };
}

export function isRecipePubliclyVisible(input: {
  status?: RecipePublishStatus | null;
}): boolean {
  return input.status === "published";
}

export function statusBadgeClass(status: RecipePublishStatus): string {
  switch (status) {
    case "published":
      return "border-emerald-600/35 bg-emerald-950/40 text-emerald-300/90";
    case "scheduled":
      return "border-sky-600/35 bg-sky-950/40 text-sky-300/90";
    case "archived":
      return "border-amber-700/35 bg-amber-950/40 text-amber-300/90";
    default:
      return "border-stone-600/35 bg-stone-800/40 text-stone-400";
  }
}

import Link from "next/link";
import type { BrewSessionRecipeStats } from "@/types/brew-sessions";
import type { RecipeSetupCompatibility } from "@/types/brewing-setup";

type BrewSessionRecipePanelProps = {
  recipeSlug: string;
  stats: BrewSessionRecipeStats | null;
  compatibility: RecipeSetupCompatibility | null;
  labels: {
    title: string;
    sessionCountTemplate: string;
    averageRatingLabel: string;
    mostRecentBrewLabel: string;
    personalNotesLabel: string;
    previousBrewsTitle: string;
    compatibilityTitle: string;
    viewCta: string;
    ratingOutOfFive: string;
    notSet: string;
  };
};

export function BrewSessionRecipePanel({ recipeSlug, stats, compatibility, labels }: BrewSessionRecipePanelProps) {
  if (!stats || stats.sessionCount === 0) return null;

  return (
    <section className="mx-auto mt-10 max-w-3xl rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
      <h2 className="text-lg font-semibold text-ac-espresso">{labels.title}</h2>
      <dl className="mt-4 grid gap-3 text-sm text-ac-espresso sm:grid-cols-2">
        <div>
          <dt className="text-ac-espresso/70">{labels.sessionCountTemplate.replace("{count}", String(stats.sessionCount))}</dt>
        </div>
        <div>
          <dt className="text-ac-espresso/70">{labels.averageRatingLabel}</dt>
          <dd className="font-medium">{stats.averageRating != null ? `${stats.averageRating}${labels.ratingOutOfFive}` : labels.notSet}</dd>
        </div>
        {stats.mostRecent ? (
          <>
            <div>
              <dt className="text-ac-espresso/70">{labels.mostRecentBrewLabel}</dt>
              <dd className="font-medium">
                <Link href={`/account/brew-sessions/${stats.mostRecent.id}`} className="underline-offset-4 hover:underline">
                  {stats.mostRecent.rating != null ? `${stats.mostRecent.rating}${labels.ratingOutOfFive}` : labels.viewCta}
                </Link>
              </dd>
            </div>
            {stats.mostRecent.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-ac-espresso/70">{labels.personalNotesLabel}</dt>
                <dd>{stats.mostRecent.notes}</dd>
              </div>
            ) : null}
          </>
        ) : null}
        {compatibility ? (
          <div className="sm:col-span-2">
            <dt className="text-ac-espresso/70">{labels.compatibilityTitle}</dt>
            <dd className="font-medium">{compatibility.summary}</dd>
          </div>
        ) : null}
      </dl>
      {stats.recentSessions.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-ac-espresso">{labels.previousBrewsTitle}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {stats.recentSessions.map((session) => (
              <li key={session.id}>
                <Link href={`/account/brew-sessions/${session.id}`} className="text-ac-espresso underline-offset-4 hover:underline">
                  {session.brewMethod ?? labels.viewCta}
                  {session.rating != null ? ` · ${session.rating}${labels.ratingOutOfFive}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <Link href={`/account/brew-sessions/new?recipe=${recipeSlug}`} className="mt-6 inline-block text-sm font-medium text-ac-espresso underline-offset-4 hover:underline">
        Log new brew session →
      </Link>
    </section>
  );
}

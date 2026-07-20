import type { BrewSessionUserAnalytics } from "@/types/brew-sessions";

type BrewSessionDashboardWidgetsProps = {
  analytics: BrewSessionUserAnalytics;
  labels: {
    recentBrews: string;
    bestBrew: string;
    favoriteCoffee: string;
    brewStreak: string;
    averageRating: string;
    favoriteMethod: string;
    favoriteOrigin: string;
    ratingOutOfFive: string;
    notSet: string;
  };
};

export function BrewSessionDashboardWidgets({ analytics, labels }: BrewSessionDashboardWidgetsProps) {
  const widgets = [
    { label: labels.recentBrews, value: String(analytics.recentBrews.length) },
    {
      label: labels.bestBrew,
      value: analytics.bestBrew?.coffeeName
        ? `${analytics.bestBrew.coffeeName}${analytics.bestBrew.rating ? ` (${analytics.bestBrew.rating}${labels.ratingOutOfFive})` : ""}`
        : labels.notSet,
    },
    { label: labels.favoriteCoffee, value: analytics.favoriteCoffee ?? labels.notSet },
    { label: labels.brewStreak, value: String(analytics.longestStreak) },
    {
      label: labels.averageRating,
      value: analytics.averageRating != null ? `${analytics.averageRating}${labels.ratingOutOfFive}` : labels.notSet,
    },
    { label: labels.favoriteMethod, value: analytics.favoriteMethod ?? labels.notSet },
    { label: labels.favoriteOrigin, value: analytics.favoriteOrigin ?? labels.notSet },
  ];

  return (
    <dl className="mt-10 grid gap-6 border-t border-ac-espresso/[0.08] pt-10 sm:grid-cols-2 lg:grid-cols-4">
      {widgets.map((widget) => (
        <div key={widget.label} className="rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl px-5 py-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-ac-espresso/70">{widget.label}</dt>
          <dd className="mt-2 text-lg font-medium text-ac-espresso">{widget.value}</dd>
        </div>
      ))}
    </dl>
  );
}

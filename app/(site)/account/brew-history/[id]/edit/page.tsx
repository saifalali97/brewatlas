import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BrewLogForm } from "@/app/components/personal/brew-log-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getGrinderOptions,
  getPublishedDbRecipes,
} from "@/lib/data/db-recipes";
import { getBrewLogById } from "@/lib/data/personal";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { LookupOption } from "@/types/recipe";

type EditBrewLogPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: EditBrewLogPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: `/account/brew-history/${id}/edit`,
    locale,
    title: dictionary.metadata.brewLogEditTitle,
    description: dictionary.metadata.brewLogEditDescription,
    noIndex: true,
  });
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toRecipeOptions(recipes: Awaited<ReturnType<typeof getPublishedDbRecipes>>): LookupOption[] {
  return recipes
    .filter((recipe): recipe is (typeof recipes)[number] & { id: string } => Boolean(recipe.id))
    .map((recipe) => ({ id: recipe.id, name: recipe.name }));
}

export default async function EditBrewLogPage({ params }: EditBrewLogPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const b = dictionary.brewLogPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?redirectTo=/account/brew-history/${id}/edit`);
  }

  const [brewLog, recipes, grinders, devices, brewingMethods] = await Promise.all([
    getBrewLogById(supabase, id, data.user.id),
    getPublishedDbRecipes(supabase),
    getGrinderOptions(supabase),
    getDeviceOptions(supabase),
    getBrewingMethodOptions(supabase),
  ]);

  if (!brewLog) {
    notFound();
  }

  return (
    <SectionFrame id="edit-brew-log-page" ariaLabelledBy="edit-brew-log-page-heading" padding="compact">
      <PageHeader eyebrow={b.editEyebrow} title={b.editTitle} description={b.editDescription} centered={false} />

      <div className="max-w-2xl rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <BrewLogForm
          mode="edit"
          brewLogId={brewLog.id}
          initialRecipeId={brewLog.recipeId ?? ""}
          initialCoffeeName={brewLog.coffeeName ?? ""}
          initialGrinderId={brewLog.grinderId ?? ""}
          initialGrindSize={brewLog.grindSize ?? ""}
          initialWaterAmount={brewLog.waterAmount !== null ? String(brewLog.waterAmount) : ""}
          initialBrewTime={brewLog.brewTime ?? ""}
          initialBrewedAt={toDatetimeLocalValue(brewLog.brewedAt)}
          initialBrewingDeviceId={brewLog.brewingDeviceId ?? ""}
          initialBrewingMethodId={brewLog.brewingMethodId ?? ""}
          initialRating={brewLog.rating !== null ? String(brewLog.rating) : ""}
          initialNotes={brewLog.notes ?? ""}
          initialIsFavorite={brewLog.isFavorite}
          recipes={toRecipeOptions(recipes)}
          grinders={grinders}
          devices={devices}
          brewingMethods={brewingMethods}
        />
      </div>
    </SectionFrame>
  );
}

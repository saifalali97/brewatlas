import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrewLogForm } from "@/app/components/personal/brew-log-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getGrinderOptions,
  getPublishedDbRecipes,
} from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { LookupOption } from "@/types/recipe";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/brew-history/new",
    locale,
    title: dictionary.metadata.brewLogNewTitle,
    description: dictionary.metadata.brewLogNewDescription,
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

export default async function NewBrewLogPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const b = dictionary.brewLogPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/brew-history/new");
  }

  const [recipes, grinders, devices, brewingMethods] = await Promise.all([
    getPublishedDbRecipes(supabase),
    getGrinderOptions(supabase),
    getDeviceOptions(supabase),
    getBrewingMethodOptions(supabase),
  ]);

  return (
    <SectionFrame id="new-brew-log-page" ariaLabelledBy="new-brew-log-page-heading" padding="compact">
      <PageHeader eyebrow={b.newEyebrow} title={b.newTitle} description={b.newDescription} centered={false} />

      <div className="max-w-2xl rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <BrewLogForm
          mode="create"
          initialRecipeId=""
          initialCoffeeName=""
          initialGrinderId=""
          initialGrindSize=""
          initialWaterAmount=""
          initialBrewTime=""
          initialBrewedAt={toDatetimeLocalValue(new Date().toISOString())}
          initialBrewingDeviceId=""
          initialBrewingMethodId=""
          initialRating=""
          initialNotes=""
          initialIsFavorite={false}
          recipes={toRecipeOptions(recipes)}
          grinders={grinders}
          devices={devices}
          brewingMethods={brewingMethods}
        />
      </div>
    </SectionFrame>
  );
}

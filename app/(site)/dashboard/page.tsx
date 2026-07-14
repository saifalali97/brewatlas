import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Clock,
  Coffee,
  Cpu,
  Heart,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { featuredRecipes } from "@/data/homepage";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getUserFavoriteRecipes, getUserRecipes } from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { signOutAction } from "@/lib/supabase/actions";
import { buttons } from "@/lib/constants/styles";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your BrewAtlas dashboard — saved recipes, brew tracking, and personalized recommendations.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Proxy already redirects unauthenticated visitors away from /dashboard;
  // this is the authoritative, non-bypassable check at the data source.
  if (!data.user) {
    redirect("/login?redirectTo=/dashboard");
  }

  await ensureProfile(supabase, data.user);

  const [{ data: profile }, favoriteRecipes, ownRecipes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, country, bio, brewing_methods(name), devices(name)")
      .eq("id", data.user.id)
      .maybeSingle(),
    getUserFavoriteRecipes(supabase, data.user.id),
    getUserRecipes(supabase, data.user.id),
  ]);

  const displayName = profile?.full_name || data.user.email || "there";
  const favoriteMethodName =
    (profile as { brewing_methods?: { name: string } | null } | null)?.brewing_methods?.name ?? "Not set";
  const recentRecipes = featuredRecipes.slice(0, 3);

  const stats = [
    { icon: Heart, label: "Saved Recipes", value: String(favoriteRecipes.length) },
    { icon: Coffee, label: "Recipes Created", value: String(ownRecipes.length) },
    { icon: BookOpen, label: "Favorite Method", value: favoriteMethodName },
  ];

  const quickLinks = [
    { icon: Sparkles, label: "AI Coach", description: "Get an instant Brew Score", href: "/coach" },
    { icon: Clock, label: "Brew History", description: "Every brew you've logged", href: "/dashboard/brew-history" },
    { icon: Users, label: "Community", description: "Leaderboards & top recipes", href: "/community" },
    { icon: Coffee, label: "Premium", description: "Unlock the full library", href: "/premium" },
    { icon: Cpu, label: "xBloom Profiles", description: "Your smart brewer settings", href: "/dashboard/xbloom" },
    { icon: Heart, label: "Saved Recipes", description: "Everything you've favorited", href: "/dashboard/favorites" },
  ];

  return (
    <SectionFrame id="dashboard-page" ariaLabelledBy="dashboard-page-heading" padding="compact">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow="Your Account"
          title={`Welcome Back, ${displayName}`}
          description="Here's a snapshot of your BrewAtlas activity."
          centered={false}
        />

        <form action={signOutAction}>
          <button type="submit" className={`${buttons.secondary} h-10 min-w-0 px-6 text-xs`}>
            Sign Out
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-stone-50">{value}</p>
              <p className="mt-1 text-sm text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04]">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-stone-500">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-stone-100">{displayName}</p>
            <p className="mt-0.5 text-sm text-stone-500">
              {profile?.country || "Country not set"}
              {profile?.bio ? ` · ${profile.bio}` : ""}
            </p>
          </div>
        </div>
        <Link href="/dashboard/profile" className={`${buttons.secondary} shrink-0`}>
          Edit Profile
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-stone-50">Quick Links</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-stone-100">{label}</p>
                <p className="mt-0.5 text-sm text-stone-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-stone-50">My Recipes</h2>
          <div className="flex items-center gap-5">
            {ownRecipes.length > 0 && (
              <Link href="/dashboard/recipes" className="text-sm font-medium text-amber-400/90 underline-offset-4 hover:underline">
                Manage all
              </Link>
            )}
            <Link href="/dashboard/recipes/new" className={`${buttons.secondary} h-10 min-w-0 gap-2 px-5 text-xs`}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New Recipe
            </Link>
          </div>
        </div>

        {ownRecipes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-6 py-8 text-sm text-stone-500">
            You haven&apos;t created any recipes yet. Share your first brew with the community.
          </p>
        ) : (
          <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
            {ownRecipes.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} featured={false} href={`/recipes/${recipe.slug}`} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-stone-50">Favorite Recipes</h2>
          {favoriteRecipes.length > 0 && (
            <Link href="/recipes" className="text-sm font-medium text-amber-400/90 underline-offset-4 hover:underline">
              Browse more
            </Link>
          )}
        </div>

        {favoriteRecipes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-6 py-8 text-sm text-stone-500">
            You haven&apos;t favorited any recipes yet. Browse the{" "}
            <Link href="/recipes" className="text-amber-400/90 underline-offset-4 hover:underline">
              recipe library
            </Link>{" "}
            and tap the heart on any recipe to save it here.
          </p>
        ) : (
          <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
            {favoriteRecipes.slice(0, 3).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} featured={false} href={`/recipes/${recipe.slug}`} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-stone-50">
          Continue Brewing
        </h2>
        <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
          {recentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.name}
              recipe={recipe}
              featured={false}
              href={`/recipes/${getRecipeSlug(recipe)}`}
            />
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

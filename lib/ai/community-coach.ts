import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserAchievements } from "@/lib/data/community-platform";
import { getUserBrewingSetup } from "@/lib/data/brewing-setup";
import { searchBrewSessions } from "@/lib/data/brew-sessions";
import { getPublicProfile } from "@/lib/data/community";

/** Formats community reputation and activity for AI Coach personalization. */
export async function buildCommunityCoachContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const [profile, setup, achievements, recentSessions] = await Promise.all([
    getPublicProfile(supabase, userId, userId),
    getUserBrewingSetup(supabase, userId),
    getUserAchievements(supabase, userId),
    searchBrewSessions(supabase, userId, { pageSize: 5, sort: "newest" }),
  ]);

  if (!profile) return "";

  const lines = ["## Community Profile"];
  lines.push(`Brew Score: ${profile.stats.brewScore}`);
  lines.push(`Followers: ${profile.stats.followersCount} · Following: ${profile.stats.followingCount}`);
  if (profile.favoriteBrewMethod?.name) lines.push(`Favorite method: ${profile.favoriteBrewMethod.name}`);
  if (profile.favoriteOrigin?.name) lines.push(`Favorite origin: ${profile.favoriteOrigin.name}`);
  if (profile.favoriteRoaster?.name) lines.push(`Favorite roaster: ${profile.favoriteRoaster.name}`);

  const unlocked = achievements.filter((item) => item.unlockedAt);
  if (unlocked.length) {
    lines.push(`Achievements: ${unlocked.map((item) => item.title).join(", ")}`);
  }

  if (setup.profile?.favoriteRoastLevel) lines.push(`Preferred roast: ${setup.profile.favoriteRoastLevel}`);
  if (setup.profile?.favoriteBrewRatio) lines.push(`Preferred ratio: ${setup.profile.favoriteBrewRatio}`);

  if (recentSessions.sessions.length) {
    lines.push(
      `Recent brews: ${recentSessions.sessions
        .slice(0, 3)
        .map((session) => `${session.coffeeName ?? "Unknown"}${session.rating ? ` (${session.rating}/5)` : ""}`)
        .join("; ")}`,
    );
  }

  lines.push("Use this community context to personalize recommendations — prefer their favorite methods, equipment, and brewing patterns.");

  return lines.join("\n");
}

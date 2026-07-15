"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OwnerRecipeRestoreModal } from "@/app/components/owner/recipes/owner-recipe-restore-modal";
import { OwnerRecipeStatusBadge } from "@/app/components/owner/recipes/owner-recipe-status-badge";
import { buttons } from "@/lib/constants/styles";
import { compareRecipeVersions } from "@/lib/data/recipe-versions";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { RecipeVersionListItem } from "@/types/recipe-publishing";

type OwnerRecipeVersionsPanelProps = {
  recipeId: string;
  recipeTitle: string;
  versions: RecipeVersionListItem[];
};

export function OwnerRecipeVersionsPanel({ recipeId, recipeTitle, versions }: OwnerRecipeVersionsPanelProps) {
  const { t } = useTranslations();
  const [leftId, setLeftId] = useState(versions[1]?.id ?? versions[0]?.id ?? "");
  const [rightId, setRightId] = useState(versions[0]?.id ?? "");

  const leftVersion = versions.find((version) => version.id === leftId) ?? null;
  const rightVersion = versions.find((version) => version.id === rightId) ?? null;

  const compareRows = useMemo(() => {
    if (!leftVersion || !rightVersion) return [];
    return compareRecipeVersions(leftVersion, rightVersion);
  }, [leftVersion, rightVersion]);

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href={`/dashboard/recipes/${recipeId}/edit`} className={`${buttons.secondary} h-10 px-4 text-xs`}>
          {t("ownerRecipePublishing.backToEditCta")}
        </Link>
      </div>

      {versions.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{t("ownerRecipePublishing.noVersionsTitle")}</p>
          <p className="mt-2 text-sm text-stone-500">{t("ownerRecipePublishing.noVersionsDescription")}</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
            <ul className="divide-y divide-white/[0.07]">
              {versions.map((version) => (
                <li key={version.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                  <div>
                    <p className="font-medium text-stone-100">
                      {t("ownerRecipePublishing.versionLabel")} {version.versionNumber}
                    </p>
                    <p className="mt-1 text-sm text-stone-300">{version.title}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {version.editorName ?? version.authorName ?? "—"} · {new Date(version.createdAt).toLocaleString()}
                    </p>
                    {version.status ? (
                      <div className="mt-2">
                        <OwnerRecipeStatusBadge
                          status={version.status}
                          scheduledPublishAt={version.scheduledPublishAt}
                        />
                      </div>
                    ) : null}
                  </div>
                  <OwnerRecipeRestoreModal
                    recipeId={recipeId}
                    versionId={version.id}
                    versionNumber={version.versionNumber}
                    title={recipeTitle}
                  />
                </li>
              ))}
            </ul>
          </div>

          {versions.length > 1 ? (
            <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-500/80">
                {t("ownerRecipePublishing.compareTitle")}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="compare-left" className="text-sm text-stone-400">
                    {t("ownerRecipePublishing.compareLeftLabel")}
                  </label>
                  <select
                    id="compare-left"
                    value={leftId}
                    onChange={(event) => setLeftId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100"
                  >
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        v{version.versionNumber} — {version.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="compare-right" className="text-sm text-stone-400">
                    {t("ownerRecipePublishing.compareRightLabel")}
                  </label>
                  <select
                    id="compare-right"
                    value={rightId}
                    onChange={(event) => setRightId(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100"
                  >
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        v{version.versionNumber} — {version.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-xl border border-white/[0.08]">
                <table className="min-w-full divide-y divide-white/[0.08] text-sm">
                  <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-stone-500">
                    <tr>
                      <th className="px-4 py-3">{t("ownerRecipePublishing.compareFieldLabel")}</th>
                      <th className="px-4 py-3">{t("ownerRecipePublishing.compareLeftLabel")}</th>
                      <th className="px-4 py-3">{t("ownerRecipePublishing.compareRightLabel")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {compareRows.map((row) => (
                      <tr key={row.key} className={row.changed ? "bg-amber-950/20" : undefined}>
                        <td className="px-4 py-3 font-medium text-stone-300">{row.label}</td>
                        <td className="px-4 py-3 text-stone-400">{row.left || "—"}</td>
                        <td className="px-4 py-3 text-stone-400">{row.right || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { BrewSessionAiPanel } from "@/app/components/personal/brew-session-ai-panel";
import { BrewSessionRowActions } from "@/app/components/personal/brew-session-tools";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { getBrewSessionById, getSimilarBrewSessions } from "@/lib/data/brew-sessions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: `/account/brew-sessions/${id}`,
    locale,
    title: dictionary.brewSessionsPage.detailEyebrow,
    description: dictionary.metadata.brewSessionsDescription,
    noIndex: true,
  });
}

function MetaRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-ac-espresso/70">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ac-espresso">{value}</dd>
    </div>
  );
}

export default async function BrewSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const l = dictionary.brewSessionsPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?redirectTo=/account/brew-sessions/${id}`);

  const session = await getBrewSessionById(supabase, authData.user.id, id);
  if (!session) notFound();

  const similarSessions = await getSimilarBrewSessions(supabase, authData.user.id, session);

  return (
    <SectionFrame id="brew-session-detail-page" ariaLabelledBy="brew-session-detail-heading" padding="compact" wide>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          headingId="brew-session-detail-heading"
          eyebrow={l.detailEyebrow}
          title={session.coffeeName ?? session.recipeTitle ?? l.title}
          description={[session.roaster, session.origin, session.brewMethod].filter(Boolean).join(" · ")}
          centered={false}
        />
        <div className="flex flex-wrap gap-3">
          <Link href={`/account/brew-sessions/${session.id}/edit`} className={buttons.secondary}>{l.editCta}</Link>
          <Link href="/account/brew-sessions" className={buttons.secondary}>{l.backToSessions}</Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ac-espresso">
        {session.favorite ? <Heart className="h-4 w-4 fill-amber-500/80 text-amber-500/80" aria-hidden /> : null}
        {session.rating != null ? (
          <span className="inline-flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-amber-400/90" aria-hidden />
            {session.rating}{l.ratingOutOfFive}
          </span>
        ) : null}
        {session.tags.map((tag) => (
          <span key={tag.id} className="rounded-full border border-ba-espresso/10 px-3 py-1 text-xs">{tag.tag}</span>
        ))}
      </div>

      {session.recipeSlug ? (
        <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
          <h2 className="text-sm font-semibold text-ac-espresso">{l.linkedRecipeTitle}</h2>
          <Link href={`/recipes/${session.recipeSlug}`} className="mt-2 inline-block text-ac-espresso underline-offset-4 hover:underline">
            {session.recipeTitle}
          </Link>
        </section>
      ) : null}

      <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
        <h2 className="text-sm font-semibold text-ac-espresso">{l.equipmentTitle}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaRow label={l.brewerLabel} value={session.brewer} />
          <MetaRow label={l.grinderLabel} value={session.grinder} />
          <MetaRow label={l.kettleLabel} value={session.kettle} />
          <MetaRow label={l.filterLabel} value={session.filter} />
          <MetaRow label={l.grinderSettingLabel} value={session.grinderSetting} />
        </dl>
      </section>

      <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
        <h2 className="text-sm font-semibold text-ac-espresso">{l.parametersTitle}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaRow label={l.doseLabel} value={session.dose} />
          <MetaRow label={l.waterLabel} value={session.water} />
          <MetaRow label={l.ratioLabel} value={session.ratio} />
          <MetaRow label={l.temperatureLabel} value={session.temperature} />
          <MetaRow label={l.bloomTimeLabel} value={session.bloomTime} />
          <MetaRow label={l.brewTimeLabel} value={session.brewTime} />
          <MetaRow label={l.yieldLabel} value={session.yieldAmount} />
          <MetaRow label={l.tdsLabel} value={session.tds} />
          <MetaRow label={l.extractionYieldLabel} value={session.extractionYield} />
        </dl>
      </section>

      {session.steps.length > 0 ? (
        <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
          <h2 className="text-sm font-semibold text-ac-espresso">{l.timelineTitle}</h2>
          <ol className="mt-4 space-y-3">
            {session.steps.map((step) => (
              <li key={step.id} className="rounded-xl border border-ba-espresso/10 px-4 py-3 text-sm text-ac-espresso">
                <p className="font-medium">#{step.stepNumber} {step.action}</p>
                <p className="mt-1 text-ac-espresso/80">
                  {[step.waterAdded != null ? `${step.waterAdded}g water` : null, step.duration, step.notes].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {session.notes ? (
        <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
          <h2 className="text-sm font-semibold text-ac-espresso">{l.notesLabel}</h2>
          <p className="mt-3 whitespace-pre-line text-sm text-ac-espresso">{session.notes}</p>
        </section>
      ) : null}

      {session.photos.length > 0 ? (
        <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
          <h2 className="text-sm font-semibold text-ac-espresso">{l.photosTitle}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {session.photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-ba-espresso/10">
                <div className="relative h-48">
                  <Image src={photo.imageUrl} alt={photo.caption ?? ""} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                {photo.caption ? <figcaption className="px-4 py-2 text-sm text-ac-espresso">{photo.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8">
        <BrewSessionAiPanel sessionId={session.id} initialAnalysis={session.aiAnalysis} />
      </div>

      {similarSessions.length > 0 ? (
        <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
          <h2 className="text-sm font-semibold text-ac-espresso">{l.similarSessionsTitle}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {similarSessions.map((item) => (
              <li key={item.id}>
                <Link href={`/account/brew-sessions/${item.id}`} className="text-ac-espresso underline-offset-4 hover:underline">
                  {item.coffeeName ?? item.recipeTitle ?? l.viewCta}
                  {item.rating != null ? ` · ${item.rating}${l.ratingOutOfFive}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6">
        <BrewSessionRowActions sessionId={session.id} favorite={session.favorite} />
      </div>
    </SectionFrame>
  );
}

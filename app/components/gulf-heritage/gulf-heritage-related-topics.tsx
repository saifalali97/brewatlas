import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { surfaces } from "@/lib/constants/styles";
import type { GulfHeritagePageCopy, GulfHeritagePageSlug } from "@/types/gulf-heritage";

type GulfHeritageRelatedTopicsProps = {
  title: string;
  pages: Array<{ slug: GulfHeritagePageSlug; copy: GulfHeritagePageCopy; href: string }>;
};

/** Related topic links within a Gulf Heritage category. */
export function GulfHeritageRelatedTopics({ title, pages }: GulfHeritageRelatedTopicsProps) {
  if (pages.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-ac-espresso sm:text-2xl">{title}</h2>
      <ul className={`${surfaces.lightList} mt-4 divide-y divide-ba-espresso/08`}>
        {pages.map((page) => (
          <li key={page.slug} className="px-5 py-4">
            <GhostCtaLink href={page.href}>{page.copy.title}</GhostCtaLink>
          </li>
        ))}
      </ul>
    </section>
  );
}

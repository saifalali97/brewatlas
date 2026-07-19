import { ghMotion, ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhFactCardProps = {
  term: string;
  definition: string;
};

/** Compact definition card for glossary and key facts. */
export function GhFactCard({ term, definition }: GhFactCardProps) {
  return (
    <article className={`${ghSurfaces.card} ${ghMotion.cardHover} p-5 motion-reduce:transform-none`}>
      <h3 className="text-sm font-semibold tracking-[-0.01em] text-ac-espresso">{term}</h3>
      {definition ? <p className="mt-2 text-sm leading-relaxed text-ac-espresso/78">{definition}</p> : null}
    </article>
  );
}

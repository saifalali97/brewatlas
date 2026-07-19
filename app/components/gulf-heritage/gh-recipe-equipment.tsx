import { getEquipmentIcon } from "@/app/components/gulf-heritage/shared/gh-recipe-utils";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhRecipeEquipmentProps = {
  title: string;
  equipment: readonly string[];
};

/** Equipment grid with icon cards. */
export function GhRecipeEquipment({ title, equipment }: GhRecipeEquipmentProps) {
  if (equipment.length === 0) return null;

  return (
    <section aria-labelledby="gh-recipe-equipment-heading">
      <h4 id="gh-recipe-equipment-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipment.map((item) => {
          const Icon = getEquipmentIcon(item);
          return (
            <li
              key={item}
              className={`${ghSurfaces.card} ${ghMotion.cardHover} flex items-center gap-3 p-4 motion-reduce:transform-none`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ba-espresso/8 bg-gradient-to-br from-ba-sand/50 to-ba-pearl">
                <Icon aria-hidden className="h-5 w-5 text-ba-bronze" strokeWidth={1.75} />
              </div>
              <span className="text-sm font-medium leading-snug text-ac-espresso">{item}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export const imageAlt = {
  hero:
    "Specialty V60 pour-over coffee being brewed in a glass server with warm ambient lighting",
  recipe: (name: string, country: string, brewMethod: string, roastLevel: string) =>
    `${name} specialty coffee recipe from ${country}, ${brewMethod} brew with ${roastLevel} roast`,
  brewingMethod: (name: string, suitableRoast: string) =>
    `${name} coffee brewing method paired with ${suitableRoast} roast beans`,
  origin: (country: string, region: string, process: string) =>
    `${country} ${region} coffee origin, ${process} processed specialty beans`,
  roaster: (name: string, country: string, specialty: string) =>
    `${name} specialty coffee roaster in ${country}, known for ${specialty}`,
  testimonial: (name: string, role: string, location: string) =>
    `${name}, ${role} from ${location}, specialty coffee professional`,
} as const;

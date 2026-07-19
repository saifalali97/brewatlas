/** Reference source types for Gulf Heritage citations. */
export type GulfHeritageReferenceType =
  | "government"
  | "museum"
  | "official-company"
  | "academic"
  | "book"
  | "journal"
  | "historical-archive";

export const GULF_HERITAGE_REFERENCE_TYPES = [
  "government",
  "museum",
  "official-company",
  "academic",
  "book",
  "journal",
  "historical-archive",
] as const satisfies readonly GulfHeritageReferenceType[];

/** A verified source citation attached to a Gulf Heritage page. */
export type GulfHeritageReference = {
  sourceName: string;
  organization: string | null;
  publication: string | null;
  url: string | null;
  retrievedDate: string | null;
  type: GulfHeritageReferenceType;
};

export function hasGulfHeritageReferences(references: readonly GulfHeritageReference[]): boolean {
  return references.length > 0;
}

export function createEmptyGulfHeritageReference(): GulfHeritageReference {
  return {
    sourceName: "",
    organization: null,
    publication: null,
    url: null,
    retrievedDate: null,
    type: "academic",
  };
}

/** Reference source types for Gulf Heritage citations. */
export type GulfHeritageReferenceType =
  | "official"
  | "book"
  | "research"
  | "museum"
  | "government"
  | "news";

/** A verified source citation attached to a Gulf Heritage page. */
export type GulfHeritageReference = {
  title: string;
  organization: string | null;
  author: string | null;
  publishedDate: string | null;
  accessedDate: string | null;
  url: string | null;
  type: GulfHeritageReferenceType;
};

export function hasGulfHeritageReferences(references: readonly GulfHeritageReference[]): boolean {
  return references.length > 0;
}

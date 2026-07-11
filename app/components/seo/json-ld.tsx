import { getJsonLdGraph } from "@/lib/seo/json-ld";

export function JsonLd() {
  const graph = getJsonLdGraph();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

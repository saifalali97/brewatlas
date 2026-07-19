/** Text formatting helpers — splits existing copy for readability without altering words. */

/** Split long editorial body into paragraph-sized chunks at sentence boundaries. */
export function splitEditorialParagraphs(body: string): readonly string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [trimmed];

  if (sentences.length <= 2) return [trimmed];

  const paragraphs: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    if (!buffer) {
      buffer = sentence;
      continue;
    }
    if (buffer.length + sentence.length > 280) {
      paragraphs.push(buffer);
      buffer = sentence;
    } else {
      buffer = `${buffer} ${sentence}`;
    }
  }

  if (buffer) paragraphs.push(buffer);
  return paragraphs.length > 0 ? paragraphs : [trimmed];
}

/** Parse glossary lines formatted as "Term — definition." */
export function parseGlossaryEntries(glossary: string): Array<{ term: string; definition: string }> {
  return glossary
    .split(/(?<=[.!])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const dashIndex = chunk.indexOf(" — ");
      if (dashIndex === -1) return { term: chunk, definition: "" };
      return {
        term: chunk.slice(0, dashIndex).trim(),
        definition: chunk.slice(dashIndex + 3).trim(),
      };
    });
}

/** Extract first sentence for pull-quote styling. */
export function extractLeadSentence(body: string): { lead: string; remainder: string | null } {
  const match = body.trim().match(/^(.+?[.!?])(?:\s+([\s\S]+))?$/);
  if (!match) return { lead: body.trim(), remainder: null };
  return { lead: match[1], remainder: match[2]?.trim() ?? null };
}

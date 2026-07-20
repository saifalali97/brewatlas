"use client";

import { useMemo } from "react";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={key++} className="rounded bg-ba-espresso/8 px-1.5 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        parts.push(
          <a key={key++} href={linkMatch[2]} className="text-ba-bronze underline underline-offset-2">
            {linkMatch[1]}
          </a>,
        );
      }
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderTableRow(line: string, isHeader = false): React.ReactNode {
  const cells = line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim());
  const Tag = isHeader ? "th" : "td";
  const cellClass = isHeader
    ? "border border-ba-espresso/10 bg-ba-sand/40 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
    : "border border-ba-espresso/10 px-3 py-2 text-sm";
  return (
    <tr key={line}>
      {cells.map((cell, i) => (
        <Tag key={i} className={cellClass}>
          {parseInline(cell)}
        </Tag>
      ))}
    </tr>
  );
}

/** Lightweight markdown renderer for AI Coach responses — no external deps. */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("```")) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        result.push(
          <pre key={key++} className="my-3 overflow-x-auto rounded-lg bg-ba-espresso/90 p-4 text-sm text-ba-pearl">
            <code>{codeLines.join("\n")}</code>
          </pre>,
        );
        i++;
        continue;
      }

      if (line.startsWith("|") && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
        const tableRows: React.ReactNode[] = [];
        tableRows.push(renderTableRow(line, true));
        i += 2;
        while (i < lines.length && lines[i].startsWith("|")) {
          tableRows.push(renderTableRow(lines[i]));
          i++;
        }
        result.push(
          <div key={key++} className="my-3 overflow-x-auto">
            <table className="w-full border-collapse">{tableRows}</table>
          </div>,
        );
        continue;
      }

      if (line.startsWith("### ")) {
        result.push(
          <h4 key={key++} className="mb-2 mt-4 text-sm font-semibold text-ba-espresso">
            {parseInline(line.slice(4))}
          </h4>,
        );
      } else if (line.startsWith("## ")) {
        result.push(
          <h3 key={key++} className="mb-2 mt-5 text-base font-semibold text-ba-espresso">
            {parseInline(line.slice(3))}
          </h3>,
        );
      } else if (line.startsWith("# ")) {
        result.push(
          <h2 key={key++} className="mb-3 mt-2 text-lg font-semibold text-ba-espresso">
            {parseInline(line.slice(2))}
          </h2>,
        );
      } else if (line.startsWith("- ")) {
        result.push(
          <li key={key++} className="ml-4 list-disc text-sm leading-relaxed text-ba-charcoal">
            {parseInline(line.slice(2))}
          </li>,
        );
      } else if (/^\d+\.\s/.test(line)) {
        result.push(
          <li key={key++} className="ml-4 list-decimal text-sm leading-relaxed text-ba-charcoal">
            {parseInline(line.replace(/^\d+\.\s/, ""))}
          </li>,
        );
      } else if (line.startsWith("_") && line.endsWith("_")) {
        result.push(
          <p key={key++} className="mt-3 text-xs italic text-stone-500">
            {parseInline(line.slice(1, -1))}
          </p>,
        );
      } else if (line.trim() === "") {
        result.push(<div key={key++} className="h-2" />);
      } else if (line.startsWith("---")) {
        result.push(<hr key={key++} className="my-4 border-ba-espresso/10" />);
      } else {
        result.push(
          <p key={key++} className="text-sm leading-relaxed text-ba-charcoal">
            {parseInline(line)}
          </p>,
        );
      }
      i++;
    }
    return result;
  }, [content]);

  return <div className={`prose-ai-coach space-y-1 ${className}`.trim()}>{elements}</div>;
}

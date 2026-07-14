import type { Dictionary, DictionaryKey } from "@/lib/i18n/types";

/**
 * Interpolates any `{placeholder}` tokens in `template` with `vars`.
 * Standalone from dictionary lookups so it can be reused for templates
 * that are threaded through props (e.g. image alt text built from
 * per-item data in a Server Component).
 */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, token: string) => {
    const value = vars[token];
    return value === undefined ? match : String(value);
  });
}

/**
 * Resolves a dot-notation key (e.g. `"dashboard.welcomeBack"`) against a
 * `Dictionary` and interpolates any `{placeholder}` tokens with `vars`.
 * Framework-agnostic and side-effect free, so it works identically from
 * a Server Component (with the dictionary loaded via `getDictionary`)
 * and a Client Component (with the dictionary read from
 * `useTranslations()`).
 */
export function translate(dictionary: Dictionary, key: DictionaryKey, vars?: Record<string, string | number>): string {
  const [namespace, field] = key.split(".") as [keyof Dictionary, string];
  const namespaceEntry = dictionary[namespace] as Record<string, string> | undefined;
  const raw = namespaceEntry?.[field];

  if (typeof raw !== "string") {
    return key;
  }
  if (!vars) return raw;

  return interpolate(raw, vars);
}

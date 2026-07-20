/** Converts human-readable brew times into ISO 8601 duration strings for Recipe schema. */
export function parseBrewDurationToIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return undefined;

  const clockMatch = trimmed.match(/^(\d+):(\d{2})$/);
  if (clockMatch) {
    const minutes = Number(clockMatch[1]);
    const seconds = Number(clockMatch[2]);
    if (minutes === 0 && seconds === 0) return undefined;
    return `PT${minutes > 0 ? `${minutes}M` : ""}${seconds > 0 ? `${seconds}S` : ""}`;
  }

  const secondsMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*sec(?:ond)?s?$/);
  if (secondsMatch) {
    const seconds = Math.round(Number(secondsMatch[1]));
    return seconds > 0 ? `PT${seconds}S` : undefined;
  }

  const minutesMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*min(?:ute)?s?$/);
  if (minutesMatch) {
    const minutes = Math.round(Number(minutesMatch[1]));
    return minutes > 0 ? `PT${minutes}M` : undefined;
  }

  const hoursMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*hr(?:s|ours?)?$/);
  if (hoursMatch) {
    const hours = Number(hoursMatch[1]);
    return hours > 0 ? `PT${hours}H` : undefined;
  }

  return undefined;
}

import i18next from "i18next";

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const BASE = 1000;

/**
 * Formats a byte count into a human-readable size using base-1000 units
 * (B, KB, MB, GB, TB) — consistent with the project's input limits
 * (e.g. MAX_INPUT_BYTES 2_000_000 → "2 MB").
 *
 * Bytes are shown as integers; KB and above keep up to 2 decimals with
 * trailing zeros stripped (1500 → "1.5 KB", 2_000_000 → "2 MB").
 *
 * The decimal separator follows `locale`, by default the app language
 * ("1,5 KB" in Spanish).
 */
export function formatBytes(
  bytes: number,
  locale: string = i18next.resolvedLanguage ?? i18next.language ?? "es",
): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  let value = bytes;
  let unitIndex = 0;
  while (value >= BASE && unitIndex < UNITS.length - 1) {
    value /= BASE;
    unitIndex += 1;
  }

  if (unitIndex === 0) {
    return `${value} B`;
  }

  // Round to 2 decimals and drop trailing zeros (1.50 → 1.5, 2.00 → 2)
  const rounded = parseFloat(value.toFixed(2));
  const formatted = new Intl.NumberFormat(locale || "es", {
    maximumFractionDigits: 2,
    useGrouping: false,
  }).format(rounded);
  return `${formatted} ${UNITS[unitIndex]}`;
}

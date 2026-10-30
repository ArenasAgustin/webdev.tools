export interface TimestampResult {
  unixSeconds: number;
  unixMilliseconds: number;
  iso8601: string;
  rfc2822: string;
  humanReadable: string;
  relative: string;
  isFuture: boolean;
  timezone: string;
  /** How a numeric input was read; null for date strings. */
  unit: UnixUnit | null;
}

export type InputType = "unix" | "date";

export type UnixUnit = "seconds" | "milliseconds";

/**
 * Magnitudes above this are read as milliseconds, the rest as seconds. 1e11 seconds is
 * year ~5138 and 1e11 ms is 1973-03-03, so real-world values of either unit fall on the
 * expected side; the UI shows the detected unit so the jump at the boundary is visible.
 */
const UNIX_MS_THRESHOLD = 1e11;

/** Unit a numeric Unix timestamp is interpreted in (see UNIX_MS_THRESHOLD). */
export function detectUnixUnit(unix: number): UnixUnit {
  return Math.abs(unix) > UNIX_MS_THRESHOLD ? "milliseconds" : "seconds";
}

/** Engines omit "UTC" from Intl.supportedValuesOf("timeZone"); make sure it can be picked. */
export function withUtc(timezones: readonly string[]): string[] {
  return timezones.includes("UTC") ? [...timezones] : ["UTC", ...timezones];
}

const MONTH_NAME = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i;

/**
 * Date shapes accepted for parsing: ISO-like (2024-01-15, 2024-01-15T10:00),
 * numeric with slashes or dots (2024/01/15, 01/15/2024, 2024.01.15) and
 * an English month name with a 4-digit year (Jan 15 2024, Mon, 15 Jan 2024 10:00:00 GMT).
 */
function looksLikeDate(value: string): boolean {
  return (
    /^\d{4}-\d{1,2}(-\d{1,2})?([T\s]|$)/.test(value) ||
    /^\d{1,4}[/.]\d{1,2}[/.]\d{1,4}(\s|$)/.test(value) ||
    (MONTH_NAME.test(value) && /\b\d{4}\b/.test(value))
  );
}

interface WallTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
}

/** Numeric dates: 2024-01-15, 2024-1-5, 2024-12, with an optional time (T or space). */
const ISO_LIKE =
  /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?)?$/;
/** 2024/01/15, 2024.01.15 (year first) or 01/15/2024 (month first, as the engine reads it), optional time. */
const SLASH_OR_DOT =
  /^(\d{1,4})[/.](\d{1,2})[/.](\d{1,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?)?$/;
/** An explicit zone (Z, +02:00, -0500, GMT, UTC) makes a date string absolute. */
const EXPLICIT_ZONE = /\d(?:Z|[+-]\d{2}:?\d{2})$|\b(?:GMT|UTC)\b/i;

function wallClock(hour?: string, minute?: string, second?: string, ms?: string) {
  return {
    hour: Number(hour ?? 0),
    minute: Number(minute ?? 0),
    second: Number(second ?? 0),
    ms: Number((ms ?? "0").padEnd(3, "0")),
  };
}

/** Wall-clock fields of a numeric date string, or null when it is not one of those shapes. */
function numericWallTime(value: string): WallTime | null {
  const iso = ISO_LIKE.exec(value);
  if (iso) {
    const [, year, month, day, hour, minute, second, ms] = iso;
    return {
      year: Number(year),
      month: Number(month),
      day: Number(day ?? 1),
      ...wallClock(hour, minute, second, ms),
    };
  }

  const slash = SLASH_OR_DOT.exec(value);
  if (slash) {
    const [, a, b, c, hour, minute, second, ms] = slash;
    const clock = wallClock(hour, minute, second, ms);
    if (a.length === 4) return { year: Number(a), month: Number(b), day: Number(c), ...clock };
    if (c.length === 4) {
      // Day first only when the first number cannot be a month (15/01/2024);
      // otherwise month first (01/15/2024). Ambiguous dates never get here.
      return Number(a) > 12
        ? { year: Number(c), month: Number(b), day: Number(a), ...clock }
        : { year: Number(c), month: Number(a), day: Number(b), ...clock };
    }
  }
  return null;
}

/**
 * The two readings of a day/month date whose order cannot be told apart
 * (01/02/2024: January 2 or February 1?), as YYYY-MM-DD; null for any other input,
 * including dates where both numbers are equal (05/05/2024) or one exceeds 12.
 */
export function ambiguousDayMonth(value: string): { monthFirst: string; dayFirst: string } | null {
  const slash = SLASH_OR_DOT.exec(value.trim());
  if (!slash) return null;
  const [, a, b, c] = slash;
  const first = Number(a);
  const second = Number(b);
  if (c.length !== 4 || first === second || first < 1 || second < 1 || first > 12 || second > 12) {
    return null;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    monthFirst: `${c}-${pad(first)}-${pad(second)}`,
    dayFirst: `${c}-${pad(second)}-${pad(first)}`,
  };
}

/** True when the fields name a real calendar date and time (no 2024-02-30, no 25:00). */
function isValidWallTime(w: WallTime): boolean {
  const date = new Date(0);
  date.setUTCFullYear(w.year, w.month - 1, w.day);
  return (
    date.getUTCFullYear() === w.year &&
    date.getUTCMonth() === w.month - 1 &&
    date.getUTCDate() === w.day &&
    w.hour <= 23 &&
    w.minute <= 59 &&
    w.second <= 59
  );
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>();

/** Offset of `timezone` from UTC at the instant `epochMs`, in ms (whole seconds). */
function timezoneOffsetMs(epochMs: number, timezone: string): number {
  let formatter = offsetFormatters.get(timezone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      era: "short",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    offsetFormatters.set(timezone, formatter);
  }
  const fields: Record<string, number> = {};
  let bc = false;
  for (const part of formatter.formatToParts(new Date(epochMs))) {
    if (part.type === "era") bc = part.value.startsWith("B");
    else if (part.type !== "literal") fields[part.type] = Number(part.value);
  }
  const shown = new Date(0);
  shown.setUTCFullYear(bc ? 1 - fields.year : fields.year, fields.month - 1, fields.day);
  shown.setUTCHours(fields.hour, fields.minute, fields.second, 0);
  return shown.getTime() - Math.floor(epochMs / 1000) * 1000;
}

/** The instant at which the clock in `timezone` shows the given wall time. */
function wallTimeToDate(w: WallTime, timezone: string): Date {
  const date = new Date(0);
  date.setUTCFullYear(w.year, w.month - 1, w.day);
  date.setUTCHours(w.hour, w.minute, w.second, w.ms);
  const guess = date.getTime();
  // A second pass settles the offset next to a DST change.
  const first = guess - timezoneOffsetMs(guess, timezone);
  return new Date(guess - timezoneOffsetMs(first, timezone));
}

/**
 * Parse input and determine if it's a Unix timestamp or a date string.
 * A date string without an explicit zone is read as wall-clock time in `timezone`
 * (date-only and date-time alike), and an impossible date (2024-02-30) is
 * rejected instead of rolling over.
 */
export function parseInput(
  input: string,
  timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
): { type: InputType; value: number | Date } | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  // A plain (possibly negative) number is always a Unix timestamp; without this
  // check "-1" would be read as a date string by the "-" heuristic below.
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { type: "unix", value: Number(trimmed) };
  }

  // 01/02/2024 is January 2 in the US and February 1 elsewhere: refuse to guess
  // (the UI asks for YYYY-MM-DD, see ambiguousDayMonth).
  if (ambiguousDayMonth(trimmed)) return null;

  // Numeric dates are read field by field, so the engine can neither roll
  // 2024-02-30 over to March nor read a date-only ISO string as UTC.
  const wall = numericWallTime(trimmed);
  if (wall) {
    return isValidWallTime(wall) ? { type: "date", value: wallTimeToDate(wall, timezone) } : null;
  }

  // Then, try to parse as date string. The engine's parser is lenient ("hello 5" becomes
  // a date in 2001), so only hand it strings with a recognizable date shape.
  if (looksLikeDate(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      if (EXPLICIT_ZONE.test(trimmed)) return { type: "date", value: date };
      // The engine read a zone-less string (Jan 15 2024) in the browser's zone:
      // keep its wall-clock fields and read them in the selected timezone instead.
      const wallTime: WallTime = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        ms: date.getMilliseconds(),
      };
      return { type: "date", value: wallTimeToDate(wallTime, timezone) };
    }
  }

  // Unix timestamps are only plain decimal numbers (checked above): Number() would
  // also take number literals such as 0x10, 1e3 or 0b101 and show a wrong date.
  return null;
}

/**
 * Convert Unix timestamp (seconds or milliseconds) to Date
 */
export function unixToDate(unix: number): Date {
  return new Date(detectUnixUnit(unix) === "milliseconds" ? unix : unix * 1000);
}

/**
 * Generate relative time string
 */
function getRelativeTime(date: Date, lang = "es", now = Date.now()): string {
  const diff = now - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  // Under a second reads as "now" (avoids "0 seconds ago" for second-precision input)
  if (absDiff < 1000) {
    return lang === "es" ? "ahora mismo" : "just now";
  }

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  // 30-day months reach 12 at 360 days, before a 365-day year; cap them at 11.
  const months = Math.min(11, Math.floor(days / 30));
  const years = Math.floor(days / 365);

  // Determine value and unit first
  let value: number;
  let unit: string;
  let isSingular: boolean;

  if (years > 0) {
    value = years;
    isSingular = years === 1;
    unit = lang === "es" ? (isSingular ? "año" : "años") : isSingular ? "year" : "years";
  } else if (months > 0) {
    value = months;
    isSingular = months === 1;
    unit = lang === "es" ? (isSingular ? "mes" : "meses") : isSingular ? "month" : "months";
  } else if (days > 0) {
    value = days;
    isSingular = days === 1;
    unit = lang === "es" ? (isSingular ? "día" : "días") : isSingular ? "day" : "days";
  } else if (hours > 0) {
    value = hours;
    isSingular = hours === 1;
    unit = lang === "es" ? (isSingular ? "hora" : "horas") : isSingular ? "hour" : "hours";
  } else if (minutes > 0) {
    value = minutes;
    isSingular = minutes === 1;
    unit = lang === "es" ? (isSingular ? "minuto" : "minutos") : isSingular ? "minute" : "minutes";
  } else {
    value = seconds;
    isSingular = seconds === 1;
    unit =
      lang === "es" ? (isSingular ? "segundo" : "segundos") : isSingular ? "second" : "seconds";
  }

  const prefix = isFuture ? (lang === "es" ? "dentro de " : "in ") : lang === "es" ? "hace " : "";
  const suffix = !isFuture && lang !== "es" ? " ago" : "";

  return `${prefix}${value} ${unit}${suffix}`;
}

/**
 * Convert input to all timestamp formats
 */
export function convertTimestamp(
  input: string,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  lang = "es",
  /** Reference time (epoch ms) for isFuture and the relative time. */
  now = Date.now(),
): TimestampResult | null {
  const parsed = parseInput(input, timezone || undefined);
  if (!parsed) return null;

  let date: Date;

  if (parsed.type === "unix") {
    date = unixToDate(parsed.value as number);
  } else {
    date = parsed.value as Date;
  }

  if (isNaN(date.getTime())) return null;

  const isFuture = date.getTime() > now;

  // Format for user's timezone
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    iso8601: date.toISOString(),
    rfc2822: date.toUTCString(),
    humanReadable: date.toLocaleString(lang === "en" ? "en-GB" : "es-ES", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    relative: getRelativeTime(date, lang, now),
    isFuture,
    timezone: userTimezone,
    unit: parsed.type === "unix" ? detectUnixUnit(parsed.value as number) : null,
  };
}

/**
 * Get current timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestampMs(): number {
  return Date.now();
}

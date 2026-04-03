export interface TimestampResult {
  unixSeconds: number;
  unixMilliseconds: number;
  iso8601: string;
  rfc2822: string;
  humanReadable: string;
  relative: string;
  isFuture: boolean;
  timezone: string;
}

export type InputType = "unix" | "date";

/**
 * Parse input and determine if it's a Unix timestamp or a date string
 */
export function parseInput(input: string): { type: InputType; value: number | Date } | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  // First, try to parse as date string (more specific check first)
  // Check for date-like patterns: contains - or : or T
  if (trimmed.includes("-") || trimmed.includes("T") || trimmed.includes(":")) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return { type: "date", value: date };
    }
  }

  // Then, try to parse as number (Unix timestamp)
  const num = parseFloat(trimmed);
  if (!isNaN(num)) {
    // Determine if it's seconds or milliseconds
    // Seconds are typically less than 1e11 (year 5138)
    // Milliseconds are typically greater than 1e11
    if (num > 1e11) {
      // Likely milliseconds
      return { type: "unix", value: num };
    } else {
      // Could be seconds or a small number
      // Check if it looks like a Unix timestamp (positive and reasonable)
      if (num > 0 && num < 1e11) {
        return { type: "unix", value: num };
      }
    }
  }

  return null;
}

/**
 * Convert Unix timestamp (seconds or milliseconds) to Date
 */
export function unixToDate(unix: number): Date {
  // If the number is greater than 1e11, assume it's milliseconds
  if (unix > 1e11) {
    return new Date(unix);
  }
  // Otherwise, assume it's seconds and convert to milliseconds
  return new Date(unix * 1000);
}

/**
 * Generate relative time string
 */
function getRelativeTime(date: Date, lang = "es"): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isFuture = diff < 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const translations: Record<string, Record<string, string>> = {
    es: {
      future: "dentro de",
      past: "hace",
      seconds: seconds === 1 ? "segundo" : "segundos",
      minutes: minutes === 1 ? "minuto" : "minutos",
      hours: hours === 1 ? "hora" : "horas",
      days: days === 1 ? "día" : "días",
      months: months === 1 ? "mes" : "meses",
      years: years === 1 ? "año" : "años",
    },
    en: {
      future: "in",
      past: "ago",
      seconds: "second(s)",
      minutes: "minute(s)",
      hours: "hour(s)",
      days: "day(s)",
      months: "month(s)",
      years: "year(s)",
    },
  };

  const t = translations[lang] || translations.es;
  const prefix = isFuture ? t.future + " " : t.past + " ";

  let value: number;
  let unit: string;

  if (years > 0) {
    value = years;
    unit = t.years;
  } else if (months > 0) {
    value = months;
    unit = t.months;
  } else if (days > 0) {
    value = days;
    unit = t.days;
  } else if (hours > 0) {
    value = hours;
    unit = t.hours;
  } else if (minutes > 0) {
    value = minutes;
    unit = t.minutes;
  } else {
    value = seconds;
    unit = t.seconds;
  }

  return `${prefix} ${value} ${unit}`;
}

/**
 * Convert input to all timestamp formats
 */
export function convertTimestamp(
  input: string,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  lang = "es",
): TimestampResult | null {
  const parsed = parseInput(input);
  if (!parsed) return null;

  let date: Date;

  if (parsed.type === "unix") {
    date = unixToDate(parsed.value as number);
  } else {
    date = parsed.value as Date;
  }

  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const isFuture = date.getTime() > now.getTime();

  // Format for user's timezone
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    iso8601: date.toISOString(),
    rfc2822: date.toUTCString(),
    humanReadable: date.toLocaleString(lang === "en" ? "en-ES" : "es-ES", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    relative: getRelativeTime(date, lang),
    isFuture,
    timezone: userTimezone,
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

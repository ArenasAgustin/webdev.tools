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

  // Handle diff = 0 (now)
  if (absDiff === 0) {
    return lang === "es" ? "ahora mismo" : "just now";
  }

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Determine value and unit first
  let value: number;
  let unit: string;
  let isSingular = false;

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

  return `${prefix}${value} ${unit}`;
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

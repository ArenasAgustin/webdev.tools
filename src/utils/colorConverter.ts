/**
 * Color conversion utilities
 */

import { CSS_NAMED_COLORS } from "./cssNamedColors";

export interface RGB {
  r: number;
  g: number;
  b: number;
  /** Alpha in [0, 1); omitted when the color is opaque. */
  a?: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface ColorFormats {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
}

// Channels are separated by commas (legacy syntax) or whitespace (modern syntax);
// the optional alpha follows a comma or a slash, as a number or a percentage.
const CHANNEL_SEP = String.raw`(?:\s*,\s*|\s+)`;
const ALPHA = String.raw`(?:\s*[,/]\s*(\d*\.?\d+)(%?))?`;
// An rgb channel is a number in 0..255 or a percentage, optionally with decimals.
const RGB_CHANNEL = String.raw`(\d*\.?\d+%?)`;
const RGB_PATTERN = new RegExp(
  String.raw`^rgba?\s*\(\s*${RGB_CHANNEL}${CHANNEL_SEP}${RGB_CHANNEL}${CHANNEL_SEP}${RGB_CHANNEL}${ALPHA}\s*\)$`,
);
const HSL_PATTERN = new RegExp(
  String.raw`^hsla?\s*\(\s*(\d+)${CHANNEL_SEP}(\d+)%?${CHANNEL_SEP}(\d+)%?${ALPHA}\s*\)$`,
);

/** Parse a captured alpha; undefined when absent, null when out of range. */
function parseAlpha(value: string | undefined, percent: string | undefined): number | null | undefined {
  if (value === undefined) return undefined;
  const alpha = Number(value) / (percent ? 100 : 1);
  return alpha <= 1 ? alpha : null;
}

/** Parse an rgb channel ("128", "50%", "10.4") to 0..255; null when out of range. */
function parseRgbChannel(value: string): number | null {
  const channel = value.endsWith("%") ? (parseFloat(value) * 255) / 100 : parseFloat(value);
  return channel <= 255 ? Math.round(channel) : null;
}

/** Attach alpha only when the color is translucent, so opaque colors stay `{ r, g, b }`. */
function withAlpha(rgb: RGB, alpha: number | undefined): RGB {
  return alpha === undefined || alpha >= 1 ? rgb : { ...rgb, a: alpha };
}

/**
 * Parse a color string to RGB. Supports hex (3, 4, 6 or 8 digits), CSS named colors,
 * rgb()/rgba() and hsl()/hsla() (comma or space syntax, optional alpha), hsv() and cmyk().
 * Channels are rounded to integers.
 */
export function parseColor(input: string): RGB | null {
  const rgb = parseColorExact(input);
  return rgb && roundRgb(rgb);
}

/** Like parseColor, but hsl/hsv/cmyk input keeps fractional channels (no rounding). */
function parseColorExact(input: string): RGB | null {
  const cleanInput = input.trim().toLowerCase();

  if (cleanInput === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // HEX format (named colors resolve to their hex value)
  const hexSource = Object.hasOwn(CSS_NAMED_COLORS, cleanInput)
    ? CSS_NAMED_COLORS[cleanInput]
    : cleanInput;
  const hexMatch = /^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/.exec(hexSource);
  if (hexMatch) {
    const digits = hexMatch[1];
    const hex =
      digits.length <= 4
        ? [...digits].map((digit) => digit + digit).join("")
        : digits;
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : undefined;
    return withAlpha(
      {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      },
      alpha,
    );
  }

  // RGB / RGBA format
  const rgbMatch = RGB_PATTERN.exec(cleanInput);
  if (rgbMatch) {
    const r = parseRgbChannel(rgbMatch[1]);
    const g = parseRgbChannel(rgbMatch[2]);
    const b = parseRgbChannel(rgbMatch[3]);
    const alpha = parseAlpha(rgbMatch[4], rgbMatch[5]);
    if (alpha !== null && r !== null && g !== null && b !== null) {
      return withAlpha({ r, g, b }, alpha);
    }
  }

  // HSL / HSLA format
  const hslMatch = HSL_PATTERN.exec(cleanInput);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10);
    const l = parseInt(hslMatch[3], 10);
    const alpha = parseAlpha(hslMatch[4], hslMatch[5]);
    if (alpha !== null && h <= 360 && s <= 100 && l <= 100) {
      return withAlpha(hslToRgbExact(h, s, l), alpha);
    }
  }

  // HSV format
  const hsvMatch = /^hsv\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/.exec(cleanInput);
  if (hsvMatch) {
    const h = parseInt(hsvMatch[1], 10);
    const s = parseInt(hsvMatch[2], 10);
    const v = parseInt(hsvMatch[3], 10);
    if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && v >= 0 && v <= 100) {
      return hsvToRgbExact(h, s, v);
    }
  }

  // CMYK format
  const cmykMatch = /^cmyk\s*\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i.exec(
    cleanInput,
  );
  if (cmykMatch) {
    const c = parseInt(cmykMatch[1], 10);
    const m = parseInt(cmykMatch[2], 10);
    const y = parseInt(cmykMatch[3], 10);
    const k = parseInt(cmykMatch[4], 10);
    if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
      return cmykToRgbExact(c, m, y, k);
    }
  }

  return null;
}

/** Round channels to integers for display; alpha is kept as is. */
function roundRgb(rgb: RGB): RGB {
  return { ...rgb, r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360) % 360,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  return roundRgb(hslToRgbExact(h, s, l));
}

/** HSL to RGB without rounding, so parsed colors keep full precision. */
function hslToRgbExact(h: number, s: number, l: number): RGB {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360) % 360,
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  return roundRgb(hsvToRgbExact(h, s, v));
}

/** HSV to RGB without rounding, so parsed colors keep full precision. */
function hsvToRgbExact(h: number, s: number, v: number): RGB {
  h = h / 360;
  s = s / 100;
  v = v / 100;

  let r: number, g: number, b: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Convert CMYK to RGB
 */
export function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  return roundRgb(cmykToRgbExact(c, m, y, k));
}

/** CMYK to RGB without rounding, so parsed colors keep full precision. */
function cmykToRgbExact(c: number, m: number, y: number, k: number): RGB {
  c = c / 100;
  m = m / 100;
  y = y / 100;
  k = k / 100;

  return {
    r: 255 * (1 - c) * (1 - k),
    g: 255 * (1 - m) * (1 - k),
    b: 255 * (1 - y) * (1 - k),
  };
}

/**
 * Get all color formats from RGB. A translucent color keeps its alpha in hex (8 digits),
 * rgba() and hsla(); hsv and cmyk have no alpha channel.
 * Channels may be fractional (parsed hsl/hsv/cmyk keep full precision): every format is
 * derived from the exact value and rounded only for display, so input does not drift.
 */
export function getAllFormats(exact: RGB): ColorFormats {
  const hsl = rgbToHsl(exact);
  const hsv = rgbToHsv(exact);
  const cmyk = rgbToCmyk(exact);
  const rgb = roundRgb(exact);

  if (rgb.a !== undefined && rgb.a < 1) {
    const alphaByte = Math.round(rgb.a * 255);
    const alphaHex = alphaByte.toString(16).padStart(2, "0").toUpperCase();
    // Two decimals, or three when two would name a different 8-bit alpha than the hex
    // (#FF000001 is 0.004, not 0; #FF0000FE is 0.996, not 1).
    const twoDecimals = Math.round(rgb.a * 100) / 100;
    const alpha =
      Math.round(twoDecimals * 255) === alphaByte ? twoDecimals : Math.round(rgb.a * 1000) / 1000;
    return {
      hex: rgbToHex(rgb) + alphaHex,
      rgb: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      hsl: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    };
  }

  return {
    hex: rgbToHex(rgb),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
  };
}

/**
 * Convert any color format to all formats
 */
export function convertColor(input: string): ColorFormats | null {
  const rgb = parseColorExact(input);
  if (!rgb) return null;
  return getAllFormats(rgb);
}

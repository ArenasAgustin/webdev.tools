import { describe, it, expect } from "vitest";
import {
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToCmyk,
  cmykToRgb,
  hslToRgb,
  hsvToRgb,
  getAllFormats,
  convertColor,
} from "./colorConverter";

describe("colorConverter - parseColor", () => {
  it("parses HEX format #RRGGBB", () => {
    const result = parseColor("#3498db");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("parses HEX format without hash", () => {
    const result = parseColor("3498db");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("parses short HEX format #RGB", () => {
    const result = parseColor("#f00");
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses short HEX format without hash", () => {
    const result = parseColor("f00");
    expect(result).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses RGB format", () => {
    const result = parseColor("rgb(52, 152, 219)");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("parses RGB format with spaces", () => {
    const result = parseColor("rgb( 52 , 152 , 219 )");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("parses RGBA format", () => {
    const result = parseColor("rgba(52, 152, 219, 1)");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("parses HSL format", () => {
    const result = parseColor("hsl(204, 70%, 53%)");
    expect(result).not.toBeNull();
    expect(result!.r).toBeGreaterThan(50);
    expect(result!.r).toBeLessThan(55);
    expect(result!.g).toBe(152);
    expect(result!.b).toBe(219);
  });

  it("parses HSV format", () => {
    const result = parseColor("hsv(204, 76%, 86%)");
    expect(result).not.toBeNull();
    expect(result!.r).toBeGreaterThan(50);
    expect(result!.r).toBeLessThan(56);
    expect(result!.g).toBeGreaterThan(150);
    expect(result!.g).toBeLessThan(156);
    expect(result!.b).toBe(219);
  });

  it("parses CMYK format", () => {
    const result = parseColor("cmyk(76%, 31%, 0%, 14%)");
    expect(result).not.toBeNull();
    expect(result!.r).toBeGreaterThan(50);
    expect(result!.r).toBeLessThan(56);
    expect(result!.g).toBeGreaterThan(149);
    expect(result!.g).toBeLessThan(156);
    expect(result!.b).toBe(219);
  });

  it("returns null for invalid input", () => {
    expect(parseColor("")).toBeNull();
    expect(parseColor("invalid")).toBeNull();
    expect(parseColor("notacolor")).toBeNull();
    expect(parseColor("rgb(256, 0, 0)")).toBeNull(); // out of range
  });

  it("handles whitespace", () => {
    const result = parseColor("  #3498db  ");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("handles case insensitivity for HEX", () => {
    expect(parseColor("#3498DB")).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("handles case insensitivity for RGB", () => {
    const result = parseColor("RGB(52, 152, 219)");
    expect(result).toEqual({ r: 52, g: 152, b: 219 });
  });
});

describe("colorConverter - rgbToHex", () => {
  it("converts RGB to HEX", () => {
    expect(rgbToHex({ r: 52, g: 152, b: 219 })).toBe("#3498DB");
  });

  it("converts black to HEX", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });

  it("converts white to HEX", () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe("#FFFFFF");
  });

  it("handles clamping", () => {
    expect(rgbToHex({ r: 300, g: -10, b: 150 })).toBe("#FF0096");
  });
});

describe("colorConverter - rgbToHsl", () => {
  it("converts RGB to HSL", () => {
    const result = rgbToHsl({ r: 52, g: 152, b: 219 });
    expect(result).toEqual({ h: 204, s: 70, l: 53 });
  });

  it("converts black to HSL", () => {
    const result = rgbToHsl({ r: 0, g: 0, b: 0 });
    expect(result).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("converts white to HSL", () => {
    const result = rgbToHsl({ r: 255, g: 255, b: 255 });
    expect(result).toEqual({ h: 0, s: 0, l: 100 });
  });

  it("converts red to HSL", () => {
    const result = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(result).toEqual({ h: 0, s: 100, l: 50 });
  });
});

describe("colorConverter - hslToRgb", () => {
  it("converts HSL to RGB (roundtrip)", () => {
    // Starting from known RGB, convert to HSL and back
    const original = { r: 52, g: 152, b: 219 };
    const hsl = rgbToHsl(original);
    const result = hslToRgb(hsl.h, hsl.s, hsl.l);
    // Allow small rounding differences
    expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
  });

  it("converts black HSL to RGB", () => {
    const result = hslToRgb(0, 0, 0);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts white HSL to RGB", () => {
    const result = hslToRgb(0, 0, 100);
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("colorConverter - rgbToHsv", () => {
  it("converts RGB to HSV", () => {
    const result = rgbToHsv({ r: 52, g: 152, b: 219 });
    expect(result).toEqual({ h: 204, s: 76, v: 86 });
  });

  it("converts black to HSV", () => {
    const result = rgbToHsv({ r: 0, g: 0, b: 0 });
    expect(result).toEqual({ h: 0, s: 0, v: 0 });
  });

  it("converts white to HSV", () => {
    const result = rgbToHsv({ r: 255, g: 255, b: 255 });
    expect(result).toEqual({ h: 0, s: 0, v: 100 });
  });
});

describe("colorConverter - hsvToRgb", () => {
  it("converts HSV to RGB (roundtrip)", () => {
    const original = { r: 52, g: 152, b: 219 };
    const hsv = rgbToHsv(original);
    const result = hsvToRgb(hsv.h, hsv.s, hsv.v);
    expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
  });

  it("converts black HSV to RGB", () => {
    const result = hsvToRgb(0, 0, 0);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts white HSV to RGB", () => {
    const result = hsvToRgb(0, 0, 100);
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("colorConverter - rgbToCmyk", () => {
  it("converts RGB to CMYK", () => {
    const result = rgbToCmyk({ r: 52, g: 152, b: 219 });
    expect(result).toEqual({ c: 76, m: 31, y: 0, k: 14 });
  });

  it("converts black to CMYK", () => {
    const result = rgbToCmyk({ r: 0, g: 0, b: 0 });
    expect(result).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it("converts white to CMYK", () => {
    const result = rgbToCmyk({ r: 255, g: 255, b: 255 });
    expect(result).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
});

describe("colorConverter - cmykToRgb", () => {
  it("converts CMYK to RGB (roundtrip)", () => {
    const original = { r: 52, g: 152, b: 219 };
    const cmyk = rgbToCmyk(original);
    const result = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
    expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(2);
    expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
  });

  it("converts black CMYK to RGB", () => {
    const result = cmykToRgb(0, 0, 0, 100);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts white CMYK to RGB", () => {
    const result = cmykToRgb(0, 0, 0, 0);
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("colorConverter - getAllFormats", () => {
  it("returns all formats from RGB", () => {
    const result = getAllFormats({ r: 52, g: 152, b: 219 });
    expect(result).toEqual({
      hex: "#3498DB",
      rgb: "rgb(52, 152, 219)",
      hsl: "hsl(204, 70%, 53%)",
      hsv: "hsv(204, 76%, 86%)",
      cmyk: "cmyk(76%, 31%, 0%, 14%)",
    });
  });

  it("handles black", () => {
    const result = getAllFormats({ r: 0, g: 0, b: 0 });
    expect(result.hex).toBe("#000000");
    expect(result.rgb).toBe("rgb(0, 0, 0)");
    expect(result.hsl).toBe("hsl(0, 0%, 0%)");
    expect(result.hsv).toBe("hsv(0, 0%, 0%)");
    expect(result.cmyk).toBe("cmyk(0%, 0%, 0%, 100%)");
  });

  it("handles white", () => {
    const result = getAllFormats({ r: 255, g: 255, b: 255 });
    expect(result.hex).toBe("#FFFFFF");
    expect(result.rgb).toBe("rgb(255, 255, 255)");
    expect(result.hsl).toBe("hsl(0, 0%, 100%)");
    expect(result.hsv).toBe("hsv(0, 0%, 100%)");
    expect(result.cmyk).toBe("cmyk(0%, 0%, 0%, 0%)");
  });
});

describe("colorConverter - convertColor", () => {
  it("converts HEX to all formats", () => {
    const result = convertColor("#3498db");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#3498DB");
    expect(result!.rgb).toBe("rgb(52, 152, 219)");
    expect(result!.hsl).toContain("hsl");
    expect(result!.hsv).toContain("hsv");
    expect(result!.cmyk).toContain("cmyk");
  });

  it("converts RGB to all formats", () => {
    const result = convertColor("rgb(52, 152, 219)");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#3498DB");
  });

  it("returns null for invalid input", () => {
    expect(convertColor("invalid")).toBeNull();
    expect(convertColor("")).toBeNull();
    expect(convertColor("not a color")).toBeNull();
  });

  it("handles black input", () => {
    const result = convertColor("#000000");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#000000");
    expect(result!.rgb).toBe("rgb(0, 0, 0)");
  });

  it("handles white input", () => {
    const result = convertColor("#ffffff");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#FFFFFF");
    expect(result!.rgb).toBe("rgb(255, 255, 255)");
  });

  it("handles red input", () => {
    const result = convertColor("#ff0000");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#FF0000");
    expect(result!.rgb).toBe("rgb(255, 0, 0)");
    expect(result!.hsl).toBe("hsl(0, 100%, 50%)");
  });

  it("handles green input", () => {
    const result = convertColor("#00ff00");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#00FF00");
    expect(result!.rgb).toBe("rgb(0, 255, 0)");
    expect(result!.hsl).toBe("hsl(120, 100%, 50%)");
  });

  it("handles blue input", () => {
    const result = convertColor("#0000ff");
    expect(result).not.toBeNull();
    expect(result!.hex).toBe("#0000FF");
    expect(result!.rgb).toBe("rgb(0, 0, 255)");
    expect(result!.hsl).toBe("hsl(240, 100%, 50%)");
  });
});

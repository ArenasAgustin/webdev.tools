// @vitest-environment node
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

  it("parses percentage and decimal rgb channels", () => {
    expect(parseColor("rgb(100%, 0%, 0%)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("rgb(100% 50% 0% / 50%)")).toEqual({ r: 255, g: 128, b: 0, a: 0.5 });
    expect(parseColor("rgb(10.4, 0, 255)")).toEqual({ r: 10, g: 0, b: 255 });
    expect(parseColor("rgb(101%, 0%, 0%)")).toBeNull();
  });

  it("round-trips hsl, hsv and cmyk input without drifting", () => {
    const drifts: string[] = [];
    for (let h = 0; h < 360; h += 13) {
      for (let a = 5; a <= 100; a += 15) {
        for (let b = 5; b <= 95; b += 15) {
          const hsl = `hsl(${h}, ${a}%, ${b}%)`;
          const hsv = `hsv(${h}, ${a}%, ${b}%)`;
          if (convertColor(hsl)?.hsl !== hsl) drifts.push(hsl);
          if (convertColor(hsv)?.hsv !== hsv) drifts.push(hsv);
        }
      }
    }
    // cmyk round-trips when it is in canonical form (one of c/m/y is 0); otherwise the
    // shared component is folded into k, which is a different notation, not drift
    for (const cmyk of ["cmyk(0%, 20%, 30%, 40%)", "cmyk(0%, 33%, 77%, 12%)", "cmyk(61%, 0%, 7%, 3%)"]) {
      if (convertColor(cmyk)?.cmyk !== cmyk) drifts.push(cmyk);
    }
    expect(drifts).toEqual([]);
  });

  it("wraps a hue that rounds up to 360 back to 0", () => {
    // raw hue is ~359.76°
    expect(rgbToHsl({ r: 255, g: 0, b: 1 }).h).toBe(0);
    expect(rgbToHsv({ r: 255, g: 0, b: 1 }).h).toBe(0);
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

  it("handles hue sector 1 (60-120°) — chartreuse", () => {
    // h=90, i=floor(90/360*6)=1 → case 1: r=q, g=v, b=p
    const result = hsvToRgb(90, 100, 100);
    expect(result.g).toBe(255);
    expect(result.b).toBe(0);
    expect(result.r).toBeGreaterThan(0);
    expect(result.r).toBeLessThan(255);
  });

  it("handles hue sector 2 (120-180°) — spring green", () => {
    // h=150, i=floor(150/360*6)=2 → case 2: r=p, g=v, b=t
    const result = hsvToRgb(150, 100, 100);
    expect(result.r).toBe(0);
    expect(result.g).toBe(255);
    expect(result.b).toBeGreaterThan(0);
    expect(result.b).toBeLessThan(255);
  });

  it("handles hue sector 4 (240-300°) — violet", () => {
    // h=270, i=floor(270/360*6)=4 → case 4: r=t, g=p, b=v
    const result = hsvToRgb(270, 100, 100);
    expect(result.b).toBe(255);
    expect(result.g).toBe(0);
    expect(result.r).toBeGreaterThan(0);
    expect(result.r).toBeLessThan(255);
  });

  it("handles hue sector 5 (300-360°) — rose", () => {
    // h=330, i=floor(330/360*6)=5 → case 5: r=v, g=p, b=q
    const result = hsvToRgb(330, 100, 100);
    expect(result.r).toBe(255);
    expect(result.g).toBe(0);
    expect(result.b).toBeGreaterThan(0);
    expect(result.b).toBeLessThan(255);
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

describe("colorConverter - alpha, named colors and 4/8-digit hex", () => {
  it("parses 4-digit and 8-digit hex with alpha", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("#f008")).toEqual({ r: 255, g: 0, b: 0, a: 136 / 255 });
    expect(parseColor("#3498db80")).toEqual({ r: 52, g: 152, b: 219, a: 128 / 255 });
    expect(parseColor("#3498dbff")).toEqual({ r: 52, g: 152, b: 219 });
  });

  it("keeps the alpha of rgba and hsla", () => {
    expect(parseColor("rgba(52, 152, 219, 0.5)")).toEqual({ r: 52, g: 152, b: 219, a: 0.5 });
    expect(parseColor("rgba(52, 152, 219, 50%)")).toEqual({ r: 52, g: 152, b: 219, a: 0.5 });
    expect(parseColor("hsla(0, 100%, 50%, .25)")).toEqual({ r: 255, g: 0, b: 0, a: 0.25 });
  });

  it("accepts the space-separated syntax with a slash alpha", () => {
    expect(parseColor("rgb(52 152 219 / 0.5)")).toEqual({ r: 52, g: 152, b: 219, a: 0.5 });
    expect(parseColor("hsl(0 100% 50%)")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("rejects an alpha outside 0..1", () => {
    expect(parseColor("rgba(0, 0, 0, 2)")).toBeNull();
    expect(parseColor("rgba(0, 0, 0, 150%)")).toBeNull();
  });

  it("parses CSS named colors and transparent", () => {
    expect(parseColor("red")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseColor("RebeccaPurple")).toEqual({ r: 102, g: 51, b: 153 });
    expect(parseColor("transparent")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
    expect(parseColor("notacolor")).toBeNull();
  });

  it("outputs alpha-aware formats when the color is translucent", () => {
    const result = convertColor("rgba(255, 0, 0, 0.5)");
    expect(result).toEqual({
      hex: "#FF000080",
      rgb: "rgba(255, 0, 0, 0.5)",
      hsl: "hsla(0, 100%, 50%, 0.5)",
      hsv: "hsv(0, 100%, 100%)",
      cmyk: "cmyk(0%, 100%, 100%, 0%)",
    });
  });

  it("keeps opaque output unchanged", () => {
    expect(convertColor("#ff0000ff")?.rgb).toBe("rgb(255, 0, 0)");
    expect(convertColor("red")?.hex).toBe("#FF0000");
  });
});

describe("colorConverter - alpha agrees across formats", () => {
  it.each(["#FF000001", "#FF0000FE", "#FF000080"])("keeps the 8-digit hex alpha of %s in rgba and hsla", (hex) => {
    const formats = convertColor(hex);
    const alphaOf = (value: string | undefined) => Number(/, ([\d.]+)\)$/.exec(value ?? "")?.[1]);
    const byte = hex.slice(7).toUpperCase();
    expect(formats?.hex).toBe(hex.toUpperCase());
    for (const value of [formats?.rgb, formats?.hsl]) {
      expect(Math.round(alphaOf(value) * 255).toString(16).padStart(2, "0").toUpperCase()).toBe(byte);
    }
  });

  it("keeps two decimals when they already round-trip", () => {
    expect(convertColor("#FF000080")?.rgb).toBe("rgba(255, 0, 0, 0.5)");
    expect(convertColor("#FF000001")?.rgb).toBe("rgba(255, 0, 0, 0.004)");
  });
});

describe("colorConverter - valid CSS channel syntax", () => {
  it.each([
    ["hsl(120.5, 50.5%, 40%)", { r: 50, g: 154, b: 51 }],
    ["hsl(120deg, 100%, 50%)", { r: 0, g: 255, b: 0 }],
    ["hsl(120deg 100% 50%)", { r: 0, g: 255, b: 0 }],
    ["hsl(0.5turn, 100%, 50%)", { r: 0, g: 255, b: 255 }],
    ["hsl(-120, 100%, 50%)", { r: 0, g: 0, b: 255 }],
    ["hsl(480, 100%, 50%)", { r: 0, g: 255, b: 0 }],
    ["rgb(255.5, 0, 0)", { r: 255, g: 0, b: 0 }],
    ["hsv(120 100% 100%)", { r: 0, g: 255, b: 0 }],
    ["hsv(120.5, 50.5%, 100%)", { r: 126, g: 255, b: 127 }],
  ])("accepts %s", (input, expected) => {
    expect(parseColor(input)).toEqual(expected);
  });

  it("still rejects out-of-range channels", () => {
    expect(parseColor("rgb(256, 0, 0)")).toBeNull();
    expect(parseColor("hsl(120, 101%, 50%)")).toBeNull();
    expect(parseColor("hsv(120, 50%, 100.5%)")).toBeNull();
  });
});

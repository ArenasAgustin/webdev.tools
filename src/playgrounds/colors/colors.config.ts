import type { PlaygroundConfig } from "@/types/playground";

export const colorsConfig: PlaygroundConfig = {
  id: "colors",
  name: {
    es: "Color Picker",
    en: "Color Picker",
  },
  icon: "fas fa-palette",
  description: {
    es: "Convierte colores entre diferentes formatos: HEX, RGB, HSL, HSV, CMYK",
    en: "Convert colors between different formats: HEX, RGB, HSL, HSV, CMYK",
  },
  language: "text",
  example: "#3498db",
  keywords: ["color", "hex", "rgb", "hsl", "hsv", "cmyk", "convert", "picker"],
};

import type { PlaygroundConfig } from "@/types/playground";

export const timestampConfig: PlaygroundConfig = {
  id: "timestamp",
  name: { es: "Unix Timestamp", en: "Unix Timestamp" },
  icon: "fas fa-clock",
  description: {
    es: "Convertir timestamps Unix a fechas y viceversa",
    en: "Convert Unix timestamps to dates and vice versa",
  },
  language: "text",
  example: "1712160000",
  keywords: ["timestamp", "unix", "date", "time", "converter", "epoch"],
};

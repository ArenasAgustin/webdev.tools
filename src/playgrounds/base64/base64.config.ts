import type { PlaygroundConfig } from "@/types/playground";

export const base64Config: PlaygroundConfig = {
  id: "base64",
  name: { es: "Base64 Encoder/Decoder", en: "Base64 Encoder/Decoder" },
  icon: "fas fa-exchange-alt",
  description: {
    es: "Codificar y decodificar Base64 desde texto o archivos, con soporte URL-safe",
    en: "Encode and decode Base64 from text or files, with URL-safe support",
  },
  language: "text",
  example: "Hello World",
  keywords: ["base64", "encode", "decode", "url-safe"],
};

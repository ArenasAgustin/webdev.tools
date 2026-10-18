import type { PlaygroundConfig } from "@/types/playground";

export const urlConfig: PlaygroundConfig = {
  id: "url",
  name: { es: "URL Encoder/Decoder", en: "URL Encoder/Decoder" },
  icon: "fas fa-link",
  description: {
    es: "Codificar y decodificar URLs (percent-encoding) para componentes, URIs completas y formularios",
    en: "Encode and decode URLs (percent-encoding) for components, full URIs and form data",
  },
  language: "text",
  example: "https://example.com/search?q=hello world&lang=es",
  keywords: ["url", "uri", "encode", "decode", "percent-encoding", "query string"],
};

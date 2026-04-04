import type { PlaygroundConfig } from "@/types/playground";

export const hashConfig: PlaygroundConfig = {
  id: "hash",
  name: { es: "Hash Generator", en: "Hash Generator" },
  icon: "fas fa-hashtag",
  description: {
    es: "Generar hashes SHA-1, SHA-256 y SHA-512 desde texto o archivos",
    en: "Generate SHA-1, SHA-256 and SHA-512 hashes from text or files",
  },
  language: "text",
  example: "Hello World",
  keywords: ["hash", "sha1", "sha256", "sha512", "generator"],
};

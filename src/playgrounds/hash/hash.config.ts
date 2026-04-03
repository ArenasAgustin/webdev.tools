import type { PlaygroundConfig } from "@/types/playground";

export const hashConfig: PlaygroundConfig = {
  id: "hash",
  name: { es: "Hash Generator", en: "Hash Generator" },
  icon: "fas fa-hashtag",
  description: {
    es: "Generar hashes MD5, SHA-1, SHA-256 y SHA-512 desde texto o archivos",
    en: "Generate MD5, SHA-1, SHA-256 and SHA-512 hashes from text or files",
  },
  language: "text",
  example: "Hello World",
  keywords: ["hash", "md5", "sha1", "sha256", "sha512", "generator"],
};

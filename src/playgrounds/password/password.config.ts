import type { PlaygroundConfig } from "@/types/playground";

export const passwordConfig: PlaygroundConfig = {
  id: "password",
  name: { es: "Password Generator", en: "Password Generator" },
  icon: "fas fa-key",
  description: {
    es: "Generar contraseñas seguras con opciones personalizables",
    en: "Generate secure passwords with customizable options",
  },
  language: "text",
  example: "Xy7#mP9$qR2",
  keywords: ["password", "generator", "secure", "random", "strength"],
};

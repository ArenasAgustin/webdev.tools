import type { PlaygroundConfig } from "@/types/playground";

export const cssPlaygroundConfig: PlaygroundConfig = {
  id: "css",
  name: "CSS tools",
  icon: "fab fa-css3-alt",
  description: "Formatear y minificar CSS",
  language: "css",
  keywords: ["CSS formatter", "CSS minifier", "CSS beautifier", "online CSS tool"],
  example: `:root {
  --primary: #2563eb;
  --surface: #0f172a;
  --text: #e2e8f0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Inter, system-ui, sans-serif;
  background: radial-gradient(circle at top, #1e293b 0%, #020617 70%);
  color: var(--text);
}

.card {
  width: min(420px, 90vw);
  padding: 1.25rem;
  border-radius: 14px;
  background: color-mix(in srgb, var(--surface) 88%, white 12%);
  border: 1px solid #334155;
}

.card button {
  margin-top: 0.75rem;
  border: 0;
  border-radius: 8px;
  background: var(--primary);
  color: white;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

/* Empty rules to clean */
.vacio { }
.solo-comentario { /* solo comentario */ }
`,
};

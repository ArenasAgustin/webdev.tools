import type { PlaygroundConfig } from "@/types/playground";

export const htmlPlaygroundConfig: PlaygroundConfig = {
  id: "html",
  name: "HTML tools",
  icon: "fab fa-html5",
  description: "Formatear y minificar HTML",
  language: "html",
  example: `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Demo HTML Playground</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem; }
      .card { border: 1px solid #ddd; border-radius: 12px; padding: 1rem; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Hola, webdev.tools</h1>
      <p>Este es un ejemplo inicial para formatear y minificar HTML.</p>
      <button id="actionBtn" type="button">Haz click</button>
    </main>

    <script>
      const button = document.getElementById("actionBtn");

      button?.addEventListener("click", () => {
        button.textContent = "¡Hecho!";
      });
    </script>
  </body>
</html>`,
};

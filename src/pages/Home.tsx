import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PlaygroundCard } from "@/components/layout/PlaygroundCard";
import {
  playgroundRegistry,
  preloadAllPlaygrounds,
  preloadPlaygroundById,
} from "@/playgrounds/registry";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function Home() {
  useDocumentMeta({
    title: "webdev.tools",
    description:
      "Suite de herramientas online para desarrolladores: formatear, minificar y filtrar JSON, ejecutar JavaScript, y más. Sin instalación, 100% en el navegador.",
    keywords:
      "JSON formatter, JSON minifier, JSONPath, JavaScript playground, herramientas desarrollo web, formatear JSON online",
    ogUrl: "https://webdev.tools/",
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let idleId: number | null = null;

    const preload = () => {
      void preloadAllPlaygrounds();
    };

    const requestIdle = globalThis.requestIdleCallback;
    const cancelIdle = globalThis.cancelIdleCallback;

    if (typeof requestIdle === "function") {
      idleId = requestIdle(preload, { timeout: 1500 });
    } else {
      timeoutId = globalThis.setTimeout(preload, 1200);
    }

    return () => {
      if (idleId !== null && typeof cancelIdle === "function") {
        cancelIdle(idleId);
      }
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <div className="relative overflow-hidden min-h-screen">
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"></div>
        <div className="pointer-events-none absolute top-40 -left-24 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl"></div>

        <div className="relative container mx-auto px-4 py-14 sm:py-20 h-full">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">
              Zona de pruebas de código
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Crea, formatea y valida rápido.
            </h1>
            <p className="mt-4 text-base text-white/70 sm:text-lg">
              Elige una zona de pruebas para empezar a editar. Cada herramienta está optimizada para
              velocidad, claridad y flujos de trabajo rápidos.
            </p>
          </header>

          <section className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playgroundRegistry.map((playground) => (
              <Link
                key={playground.id}
                to={`/playground/${playground.id}`}
                className="h-full"
                onMouseEnter={() => {
                  void preloadPlaygroundById(playground.id);
                }}
                onFocus={() => {
                  void preloadPlaygroundById(playground.id);
                }}
              >
                <PlaygroundCard playground={playground} />
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

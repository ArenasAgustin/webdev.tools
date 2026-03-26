import { Suspense, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PlaygroundLoader } from "@/components/common/PlaygroundLoader";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PlaygroundSidebar } from "@/components/layout/PlaygroundSidebar";
import { getPlaygroundById } from "@/playgrounds/registry";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useIdleCallback } from "@/hooks/useIdleCallback";

export function PlaygroundPage() {
  const { playgroundId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const playground = getPlaygroundById(playgroundId ?? "");

  useIdleCallback(
    () => {
      void import("@monaco-editor/react");
    },
    { timeout: 1200 },
  );

  useDocumentMeta({
    title: playground?.name ?? "Playground",
    description: playground
      ? `${playground.description}. Herramienta online para desarrolladores, sin instalación. Parte de webdev.tools.`
      : "Herramientas de desarrollo web online",
    keywords:
      playground?.keywords ??
      (playground
        ? `${playground.name}, ${playground.description}, herramientas desarrollo web online`
        : "herramientas desarrollo web"),
    ogUrl: playground
      ? `https://webdev.tools/playground/${playground.id}`
      : "https://webdev.tools/",
    ogImage: playground ? `/og/${playground.id}.png` : undefined,
    jsonLd: playground
      ? {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: playground.name,
          description: playground.description,
          url: `https://webdev.tools/playground/${playground.id}`,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }
      : undefined,
  });

  if (!playground) {
    return <Navigate to="/" replace />;
  }

  const PlaygroundComponent = playground.component;

  return (
    <div className="h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
      <PlaygroundSidebar
        currentPlaygroundId={playground.id}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        ></button>
      ) : null}

      <button
        type="button"
        className="fixed right-4 top-4 z-30 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white/90 backdrop-blur-lg transition hover:bg-white/20"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <i className="fas fa-bars" aria-hidden="true"></i>
      </button>

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="container mx-auto flex flex-1 min-h-0 max-w-7xl flex-col gap-4 px-2 py-3 sm:px-4 sm:py-5">
          <header className="rounded-xl border border-white/5 bg-white/10 px-4 py-2 sm:py-3 shadow-2xl shadow-black/30 backdrop-blur-md">
            <p className="hidden sm:block text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              Playground
            </p>
            <div className="mt-1 sm:mt-2 flex items-center gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                <i className={`${playground.icon}`}></i>
              </div>
              <div>
                <h1 className="text-lg font-semibold sm:text-xl">{playground.name}</h1>
                <p className="hidden sm:block text-xs text-white/60">{playground.description}</p>
              </div>
            </div>
          </header>

          <div key={playgroundId} className="flex-1 min-h-0 flex flex-col gap-4 fade-in">
            <ErrorBoundary name={playground.name}>
              <Suspense fallback={<PlaygroundLoader name={playground.name} />}>
                <PlaygroundComponent />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

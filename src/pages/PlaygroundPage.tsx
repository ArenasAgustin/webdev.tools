import { Suspense, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PlaygroundLoader } from "@/components/common/PlaygroundLoader";
import { PlaygroundSidebar } from "@/components/layout/PlaygroundSidebar";
import { getPlaygroundById } from "@/playgrounds/registry";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export function PlaygroundPage() {
  const { playgroundId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const playground = getPlaygroundById(playgroundId ?? "");

  useDocumentMeta({
    title: playground?.name ?? "Playground",
    description: playground
      ? `${playground.description}. Herramienta online para desarrolladores, sin instalación. Parte de webdev.tools.`
      : "Herramientas de desarrollo web online",
    keywords: playground
      ? `${playground.name}, ${playground.description}, herramientas desarrollo web online`
      : "herramientas desarrollo web",
    ogUrl: playground
      ? `https://webdev.tools/playground/${playground.id}`
      : "https://webdev.tools/",
  });

  if (!playground) {
    return <Navigate to="/" replace />;
  }

  const PlaygroundComponent = playground.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
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

      <div>
        <div className="container mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-2 py-3 sm:px-4 sm:py-5">
          <header className="rounded-xl border border-white/5 bg-white/10 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Playground</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                <i className={`${playground.icon}`}></i>
              </div>
              <div>
                <h1 className="text-lg font-semibold sm:text-xl">{playground.name}</h1>
                <p className="text-xs text-white/60">{playground.description}</p>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 flex flex-col gap-4">
            <Suspense fallback={<PlaygroundLoader />}>
              <PlaygroundComponent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

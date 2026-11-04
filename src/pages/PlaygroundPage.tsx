import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PlaygroundLoader } from "@/components/common/PlaygroundLoader";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PlaygroundSidebar } from "@/components/layout/PlaygroundSidebar";
import { getPlaygroundById, type PlaygroundRegistryItem } from "@/playgrounds/registry";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getPlaygroundMeta } from "@/utils/routeMeta";
import { useIdleCallback } from "@/hooks/useIdleCallback";
import { getLocalizedString } from "@/types/playground";
import { NotFound } from "@/pages/NotFound";

export function PlaygroundPage() {
  const { playgroundId } = useParams();
  const playground = getPlaygroundById(playgroundId ?? "");

  // An unknown id gets a real not-found page (noindex) rather than a redirect home,
  // so crawlers do not index the URL as a copy of the home page.
  if (!playground) {
    return <NotFound />;
  }

  return <PlaygroundView playground={playground} />;
}

function PlaygroundView({ playground }: { playground: PlaygroundRegistryItem }) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const playgroundId = playground.id;

  const name = getLocalizedString(playground.name);
  const description = getLocalizedString(playground.description);

  useIdleCallback(
    () => {
      void import("@monaco-editor/react");
    },
    { timeout: 1200 },
  );

  const translateMeta = (key: string, options?: Record<string, unknown>) => t(key, options);
  useDocumentMeta(
    getPlaygroundMeta(
      {
        id: playground.id,
        name,
        description,
        keywords: playground.keywords,
      },
      translateMeta,
    ),
  );

  const PlaygroundComponent = playground.component;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white overflow-hidden">
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
          aria-label={t("page.closeSidebarOverlay")}
        ></button>
      ) : null}

      <button
        type="button"
        className="fixed right-4 top-4 z-30 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white/90 backdrop-blur-lg transition hover:bg-white/20"
        onClick={() => setSidebarOpen(true)}
        aria-label={t("page.openSidebar")}
      >
        <i className="fas fa-bars" aria-hidden="true"></i>
      </button>

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <div className="container mx-auto flex flex-1 min-h-0 max-w-7xl flex-col gap-4 px-2 py-3 sm:px-4 sm:py-5">
          <header className="rounded-xl border border-white/5 bg-white/10 px-4 py-2 sm:py-3 shadow-2xl shadow-black/30 backdrop-blur-md">
            <p className="hidden sm:block text-xs uppercase tracking-[0.3em] text-cyan-200/70">
              {t("page.playground")}
            </p>
            <div className="mt-1 sm:mt-2 flex items-center gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-100">
                <i className={`${playground.icon}`}></i>
              </div>
              <div>
                <h1 className="text-lg font-semibold sm:text-xl">{name}</h1>
                <p className="hidden sm:block text-xs text-white/60">{description}</p>
              </div>
            </div>
          </header>

          <main key={playgroundId} className="flex-1 min-h-0 flex flex-col gap-4 fade-in">
            <ErrorBoundary name={name ?? playground.id}>
              <Suspense fallback={<PlaygroundLoader name={name ?? playground.id} />}>
                <PlaygroundComponent />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}

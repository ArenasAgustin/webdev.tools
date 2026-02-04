import { lazy, Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { PlaygroundLoader } from "@/components/common/PlaygroundLoader";

// Lazy load JsonPlayground for code splitting
const JsonPlayground = lazy(() =>
  import("@/playgrounds/json/JsonPlayground").then((module) => ({
    default: module.JsonPlayground,
  })),
);

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-sm">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl min-h-screen grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 sm:gap-4">
        <Header />
        <Suspense fallback={<PlaygroundLoader />}>
          <JsonPlayground />
        </Suspense>
      </div>
    </div>
  );
}

export default App;

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/common/ToastContainer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { InstallPromptBanner } from "@/components/common/InstallPromptBanner";
import { UpdatePromptBanner } from "@/components/common/UpdatePromptBanner";
import { Home } from "@/pages/Home";
import { NotFound } from "@/pages/NotFound";
import { PlaygroundPage } from "@/pages/PlaygroundPage";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineBanner />
        {/* Viewport-height shell: routes scroll inside the flexible area, so the
            in-flow install banner below never overlaps page controls. */}
        <div className="flex h-dvh flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/playground/:playgroundId" element={<PlaygroundPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
          <UpdatePromptBanner />
          <InstallPromptBanner />
        </div>
        <ToastContainer />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

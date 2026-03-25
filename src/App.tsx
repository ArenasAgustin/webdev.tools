import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@/context/ToastContext";
import { ToastContainer } from "@/components/common/ToastContainer";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import { InstallPromptBanner } from "@/components/common/InstallPromptBanner";
import { Home } from "@/pages/Home";
import { PlaygroundPage } from "@/pages/PlaygroundPage";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OfflineBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/playground/:playgroundId" element={<PlaygroundPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
        <InstallPromptBanner />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;

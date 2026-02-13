import { Link } from "react-router-dom";
import { playgroundRegistry } from "@/playgrounds/registry";

interface PlaygroundSidebarProps {
  currentPlaygroundId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PlaygroundSidebar({
  currentPlaygroundId,
  isOpen,
  onClose,
}: PlaygroundSidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 w-64 transform border-l border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl transition duration-300 lg:rounded-l-2xl ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 text-white/90 transition hover:text-white"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <i className="fas fa-layer-group"></i>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">WebDev Tools</p>
              <p className="text-sm font-semibold">Inicio</p>
            </div>
          </Link>
          <button
            type="button"
            className="text-white/60 transition hover:text-white"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-2 text-xs uppercase tracking-[0.25em] text-white/50">Playgrounds</p>
          <ul className="mt-4 space-y-2">
            {playgroundRegistry.map((playground) => {
              const isActive = playground.id === currentPlaygroundId;
              return (
                <li key={playground.id}>
                  <Link
                    to={`/playground/${playground.id}`}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                      isActive
                        ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-100"
                        : "border-white/5 text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={onClose}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isActive ? "bg-cyan-400/20" : "bg-white/5"
                      }`}
                    >
                      <i className={`${playground.icon} text-sm`}></i>
                    </span>
                    <span className="font-medium">{playground.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

import { type ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  icon: string;
  iconColor?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

const colorMap: Record<string, string> = {
  "blue-400": "#60a5fa",
  "blue-300": "#93c5fd",
  "purple-400": "#c084fa",
  "green-400": "#4ade80",
  "red-400": "#f87171",
  "yellow-400": "#facc15",
  "orange-400": "#fb923c",
  "cyan-400": "#06b6d4",
  "pink-400": "#f472b6",
};

export function Modal({
  isOpen,
  title,
  icon,
  iconColor = "blue-400",
  children,
  footer,
  onClose,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  if (!isOpen) return null;

  const iconHexColor = colorMap[iconColor] || colorMap["blue-400"];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-gray-900 border border-white/10 rounded-2xl shadow-2xl ${maxWidth} w-full mx-4 max-h-[80vh] overflow-hidden fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <i className={`fas fa-${icon}`} style={{ color: iconHexColor }}></i>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            aria-label="Cerrar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

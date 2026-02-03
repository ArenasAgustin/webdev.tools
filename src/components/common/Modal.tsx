import { type ReactNode, useEffect } from "react";
import { getIconColorClass, type IconColorKey } from "@/utils/constants/colors";

interface ModalProps {
  isOpen: boolean;
  title: string;
  icon: string;
  iconColor?: IconColorKey;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

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
  const iconColorClass = getIconColorClass(iconColor);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-gray-900 border border-white/10 rounded-2xl shadow-2xl ${maxWidth} w-full mx-4 max-h-[80vh] overflow-hidden fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <i className={`fas fa-${icon} ${iconColorClass}`}></i>
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

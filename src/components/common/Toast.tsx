import { useEffect, useState } from "react";
import type { ToastVariant } from "@/context/toast.context";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  duration: number;
  onRemove: () => void;
}

const variantConfig = {
  success: {
    bg: "bg-green-500/20 border-green-500/30",
    text: "text-green-300",
    icon: "fa-check-circle",
  },
  error: {
    bg: "bg-red-500/20 border-red-500/30",
    text: "text-red-300",
    icon: "fa-exclamation-circle",
  },
  info: {
    bg: "bg-blue-500/20 border-blue-500/30",
    text: "text-blue-300",
    icon: "fa-info-circle",
  },
};

export function Toast({ message, variant, duration, onRemove }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const config = variantConfig[variant];

  useEffect(() => {
    // Remove the entering state after animation
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 300);

    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  };

  return (
    <div
      className={`
        w-80 transform transition-all duration-300 ease-out
        ${isEntering ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
        ${isExiting ? "translate-x-full opacity-0" : ""}
      `}
    >
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded border backdrop-blur-sm
          ${config.bg} ${config.text}
        `}
      >
        <i className={`fas ${config.icon}`} aria-hidden="true" />
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 hover:opacity-75 transition-opacity flex-shrink-0"
          aria-label="Close notification"
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

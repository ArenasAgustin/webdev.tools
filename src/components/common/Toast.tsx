import { useEffect, useRef, useState } from "react";
import type { ToastVariant } from "@/context/toast.context";
import { cn } from "@/utils/cn";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const config = variantConfig[variant];

  // Capture latest onRemove in a ref so the timer effect never needs to re-run
  // when the caller passes a new function reference on each render.
  // This is intentional and safe: we want the latest onRemove, and the effect
  // has no dependencies so it runs on every render to keep the ref up-to-date.
  const onRemoveRef = useRef(onRemove);
  useEffect(() => {
    onRemoveRef.current = onRemove;
  });

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Remove the entering state after animation
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 300);

    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    let removeTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      setIsExiting(true);
      removeTimer = setTimeout(() => onRemoveRef.current(), 200);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
      // Also clear any in-flight close timer started by handleClose
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, [duration]);

  const handleClose = () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    setIsExiting(true);
    closeTimerRef.current = setTimeout(() => onRemoveRef.current(), 200);
  };

  return (
    <div
      className={cn(
        "w-80 max-w-[calc(100vw-2rem)] transform transition-all duration-300 ease-out",
        isEntering ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100",
        isExiting && "-translate-x-full opacity-0",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded border backdrop-blur-sm",
          config.bg,
          config.text,
        )}
      >
        <i className={`fas ${config.icon}`} aria-hidden="true" />
        <span className="text-sm font-medium flex-1 min-w-0 break-all line-clamp-4 overflow-hidden" data-testid="toast-message">{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 hover:opacity-75 transition-opacity flex-shrink-0"
          aria-label={t("close_notification")}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

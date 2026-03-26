import { useRef } from "react";
import { cn } from "@/utils/cn";

interface EditorTabBarProps {
  activeTab: "input" | "output";
  onTabChange: (tab: "input" | "output") => void;
  inputLabel?: string;
  outputLabel?: string;
}

export function EditorTabBar({
  activeTab,
  onTabChange,
  inputLabel = "Input",
  outputLabel = "Output",
}: EditorTabBarProps) {
  const inputRef = useRef<HTMLButtonElement>(null);
  const outputRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      onTabChange("output");
      outputRef.current?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onTabChange("input");
      inputRef.current?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Editor panels"
      className="flex sm:hidden border-b border-white/10 mb-2"
    >
      <button
        ref={inputRef}
        role="tab"
        aria-selected={activeTab === "input"}
        aria-controls="panel-input"
        type="button"
        onClick={() => onTabChange("input")}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 py-2 text-sm font-medium transition-colors",
          activeTab === "input"
            ? "bg-blue-500/20 border-b-2 border-blue-400 text-white"
            : "text-white/50 hover:text-white/70",
        )}
      >
        {inputLabel}
      </button>
      <button
        ref={outputRef}
        role="tab"
        aria-selected={activeTab === "output"}
        aria-controls="panel-output"
        type="button"
        onClick={() => onTabChange("output")}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex-1 py-2 text-sm font-medium transition-colors",
          activeTab === "output"
            ? "bg-blue-500/20 border-b-2 border-blue-400 text-white"
            : "text-white/50 hover:text-white/70",
        )}
      >
        {outputLabel}
      </button>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/utils/cn";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  noResultsLabel?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Search...",
  noResultsLabel = "No results",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
    if (open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2 min-w-[220px] focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
      >
        <span className="flex-1 text-left truncate">{value}</span>
        <i
          className={cn("fas fa-chevron-down text-xs transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-72 bg-gray-900 border border-white/20 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white/10 rounded px-2 py-1.5 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-white/40">{noResultsLabel}</li>
            ) : (
              filtered.map((option) => (
                <li key={option} role="option" aria-selected={option === value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm transition-colors",
                      option === value
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-white/80 hover:bg-white/10",
                    )}
                  >
                    {option}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

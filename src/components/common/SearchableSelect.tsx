import { useState, useRef, useEffect, useCallback, useId } from "react";
import { cn } from "@/utils/cn";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  noResultsLabel?: string;
  className?: string;
}

/**
 * Button that opens a filterable listbox. The search box is the combobox
 * (ARIA 1.2 pattern): focus stays in it while ArrowUp/ArrowDown move the active
 * option (aria-activedescendant), Enter selects it and Escape closes the list.
 */
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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;
  const hasActive = filtered.length > 0;
  const active = Math.min(activeIndex, filtered.length - 1);
  const activeId = hasActive ? optionId(active) : undefined;

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  const handleSelect = useCallback(
    (option: string) => {
      onChange(option);
      close();
      triggerRef.current?.focus();
    },
    [onChange, close],
  );

  const handleToggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    setActiveIndex(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }, [open, close, options, value]);

  const handleSearchChange = useCallback((next: string) => {
    setSearch(next);
    setActiveIndex(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex(Math.min(active + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex(Math.max(active - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(Math.max(filtered.length - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (hasActive) handleSelect(filtered[active]);
          break;
        case "Escape":
          e.preventDefault();
          close();
          triggerRef.current?.focus();
          break;
        case "Tab":
          close();
          break;
      }
    },
    [active, filtered, hasActive, handleSelect, close],
  );

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the active option visible while moving through a long list.
  useEffect(() => {
    if (!open || !activeId) return;
    const element = listRef.current?.querySelector(`[id="${activeId}"]`);
    element?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeId]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
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
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeId}
              aria-label={placeholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-white/10 rounded px-2 py-1.5 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <ul ref={listRef} id={listboxId} className="max-h-60 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-white/40">{noResultsLabel}</li>
            ) : (
              filtered.map((option, index) => (
                <li
                  key={option}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option === value}
                  onClick={() => handleSelect(option)}
                  onMouseMove={() => {
                    if (index !== active) setActiveIndex(index);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors",
                    option === value ? "text-cyan-300" : "text-white/80",
                    index === active ? "bg-white/10" : option === value && "bg-cyan-500/20",
                  )}
                >
                  {option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

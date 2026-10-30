import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

const languages = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
] as const;

/**
 * Menu button (ARIA menu pattern): the trigger opens a menu of radio items,
 * focus moves to the checked one, ArrowUp/ArrowDown/Home/End move between
 * items and Escape closes the menu and returns focus to the trigger.
 */
export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // resolvedLanguage is the translation in use: "en" for a regional en-US and for
  // an untranslated fr-FR (English fallback), where i18n.language keeps the raw tag.
  const currentLang =
    languages.find((lang) => lang.code === (i18n.resolvedLanguage ?? i18n.language)) ?? languages[1];
  const currentIndex = languages.indexOf(currentLang);

  // Focus the checked item when the menu opens (a language change closes it).
  useEffect(() => {
    if (isOpen) itemsRef.current[currentIndex]?.focus();
  }, [isOpen, currentIndex]);

  const close = (returnFocus: boolean) => {
    setIsOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const handleLanguageChange = (code: string) => {
    void i18n.changeLanguage(code);
    close(true);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const focused = itemsRef.current.indexOf(document.activeElement as HTMLButtonElement);
    const last = languages.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowDown") next = focused >= last ? 0 : focused + 1;
    else if (event.key === "ArrowUp") next = focused <= 0 ? last : focused - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    } else if (event.key === "Tab") {
      close(false);
      return;
    }
    if (next !== null) {
      event.preventDefault();
      itemsRef.current[next]?.focus();
    }
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm",
          "bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
        )}
        aria-label={t("language.select")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
      >
        <span className="font-medium uppercase">{currentLang.label}</span>
        <i
          className={cn("fas fa-chevron-down text-xs transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => close(false)} aria-hidden="true" />
          <ul
            id={menuId}
            role="menu"
            aria-label={t("language.select")}
            onKeyDown={handleMenuKeyDown}
            className={cn(
              "absolute right-0 top-full z-20 mt-2 w-full min-w-[140px] overflow-hidden rounded-xl",
              "border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl",
            )}
          >
            {languages.map((lang, index) => (
              <li key={lang.code} role="none">
                <button
                  ref={(element) => {
                    itemsRef.current[index] = element;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={lang.code === currentLang.code}
                  tabIndex={-1}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                    "transition-colors hover:bg-white/10 focus:bg-white/10 focus:outline-none",
                    lang.code === currentLang.code
                      ? "bg-cyan-500/20 text-cyan-200"
                      : "text-white/80",
                  )}
                >
                  <span className="font-medium uppercase">{lang.label}</span>
                  {lang.code === currentLang.code && (
                    <i className="fas fa-check ml-auto text-xs text-cyan-400" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

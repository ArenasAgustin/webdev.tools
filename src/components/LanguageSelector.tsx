import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/utils/cn";

const languages = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find((lang) => lang.code === i18n.language) ?? languages[0];

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm",
          "bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/50",
        )}
        aria-label={t("language.select")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="font-medium uppercase">{currentLang.label}</span>
        <i
          className={cn("fas fa-chevron-down text-xs transition-transform", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            className={cn(
              "absolute right-0 top-full z-20 mt-2 w-full min-w-[140px] overflow-hidden rounded-xl",
              "border border-white/10 bg-white/10 shadow-xl backdrop-blur-xl",
            )}
          >
            {languages.map((lang) => (
              <li key={lang.code} role="option" aria-selected={lang.code === currentLang.code}>
                <button
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm",
                    "transition-colors hover:bg-white/10",
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

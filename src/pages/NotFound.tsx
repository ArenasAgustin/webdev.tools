import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getMissingPlaygroundMeta } from "@/utils/routeMeta";

/**
 * Not-found page. Every URL is served the same SPA HTML with status 200, so this
 * page marks itself noindex (and drops the home canonical) instead of redirecting
 * home, which crawlers would index as a duplicate of the home page (soft 404).
 */
export function NotFound() {
  const { t } = useTranslation();

  useDocumentMeta(getMissingPlaygroundMeta((key, options) => t(key, options)));

  return (
    <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 text-white">
      <main className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">404</p>
        <h1 className="mt-4 text-3xl font-semibold">{t("notFound.title")}</h1>
        <p className="mt-3 text-white/70">{t("notFound.message")}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white/90 transition hover:bg-white/20"
        >
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
          {t("notFound.backHome")}
        </Link>
      </main>
    </div>
  );
}

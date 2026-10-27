import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const PREVIEW_DEBOUNCE_MS = 300;

/**
 * DOM inspection helper
 */
function inspectDom(source: string): string | null {
  if (!source.trim()) {
    return null;
  }

  const parsed = new DOMParser().parseFromString(source, "text/html");
  const tags = Array.from(parsed.querySelectorAll("*"));

  if (tags.length === 0) {
    return null;
  }

  const counters = new Map<string, number>();
  for (const node of tags) {
    const tagName = node.tagName.toLowerCase();
    counters.set(tagName, (counters.get(tagName) ?? 0) + 1);
  }

  return Array.from(counters.entries())
    .slice(0, 8)
    .map(([tag, count]) => `${tag} (${count})`)
    .join(" · ");
}

/**
 * Live HTML preview. The source is debounced so typing does not reload the
 * iframe or re-parse the DOM on every keystroke.
 */
export function HtmlPreview({ source }: { source: string }) {
  const { t } = useTranslation();
  const debouncedSource = useDebouncedValue(source, PREVIEW_DEBOUNCE_MS);
  const domInspection = useMemo(() => inspectDom(debouncedSource), [debouncedSource]);

  return (
    <div className="flex h-full min-h-[220px] flex-col gap-2">
      <iframe
        title={t("html.previewLabel")}
        srcDoc={debouncedSource}
        sandbox="allow-scripts"
        className="h-full min-h-[150px] w-full rounded-lg border border-white/10 bg-white"
      />
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
        <div className="mb-1 font-medium text-cyan-300">{t("html.domInspection")}</div>
        {domInspection ? (
          <span data-testid="dom-inspection-summary">{domInspection}</span>
        ) : (
          <span className="text-gray-400">{t("html.noElements")}</span>
        )}
      </div>
    </div>
  );
}

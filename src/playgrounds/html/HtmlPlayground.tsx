import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { GenericPlayground } from "../GenericPlayground";
import { htmlEngine } from "../engines/html.engine";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { OutputActions } from "@/components/editor/OutputActions";
import { Button } from "@/components/common/Button";
import { EditorFooter } from "@/components/common/EditorFooter";

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
 * HTML Playground - Uses GenericPlayground with custom output panel
 */
export function HtmlPlayground() {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const renderOutputActions = useCallback(() => {
    return (
      <Button
        variant="cyan"
        onClick={() => setShowPreview(true)}
        aria-label={t("html.viewPreview")}
        title={t("html.viewPreview")}
      >
        <i className="fas fa-eye"></i>
      </Button>
    );
  }, [t]);

  const renderOutputPanel = useCallback(
    (props: {
      input: string;
      output: string;
      error: string | null;
      outputStats: { lines: number; characters: number; bytes: number };
      comparisonBytes: number;
      expandOutput: () => void;
      onCopyOutput: () => void;
      onDownloadOutput: () => void;
      onUseOutputAsInput?: () => void;
    }) => {
      const previewSource = props.output.trim() ? props.output : props.input;
      const domInspection = inspectDom(previewSource);

      if (showPreview) {
        return (
          <Panel
            title={t("html.previewLabel")}
            icon="eye"
            iconColor="cyan-400"
            actions={
              <Button
                variant="primary"
                onClick={() => setShowPreview(false)}
                aria-label={t("html.viewResult")}
                title={t("html.viewResult")}
              >
                <i className="fas fa-terminal"></i>
              </Button>
            }
          >
            <div className="flex h-full min-h-[220px] flex-col gap-2">
              <iframe
                title={t("html.previewLabel")}
                srcDoc={previewSource}
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
          </Panel>
        );
      }

      return (
        <Panel
          title={t("html.resultLabel")}
          icon="terminal"
          iconColor="green-400"
          actions={
            <>
              <OutputActions
                onCopyOutput={props.onCopyOutput}
                onDownloadOutput={props.onDownloadOutput}
                onExpand={props.expandOutput}
                onUseOutputAsInput={props.onUseOutputAsInput}
              />
              <Button
                variant="cyan"
                onClick={() => setShowPreview(true)}
                aria-label={t("html.viewPreview")}
                title={t("html.viewPreview")}
              >
                <i className="fas fa-eye"></i>
              </Button>
            </>
          }
          footer={
            <EditorFooter
              variant="output"
              value={props.output}
              error={props.error}
              isProcessing={false}
              stats={props.outputStats}
              comparisonBytes={props.comparisonBytes}
            />
          }
        >
          <LazyCodeEditor
            value={props.output}
            language="html"
            readOnly={true}
            placeholder={t("editor.outputPlaceholder")}
          />
        </Panel>
      );
    },
    [showPreview, t],
  );

  return (
    <GenericPlayground
      engine={htmlEngine}
      renderOutputActions={renderOutputActions}
      renderOutputPanel={renderOutputPanel}
    />
  );
}

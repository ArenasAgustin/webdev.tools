import { useState, useCallback } from "react";
import type { OutputPanelProps } from "../engines/types";
import { useTranslation } from "react-i18next";
import { GenericPlayground } from "../GenericPlayground";
import { htmlEngine } from "../engines/html.engine";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { OutputActions } from "@/components/editor/OutputActions";
import { Button } from "@/components/common/Button";
import { EditorFooter } from "@/components/common/EditorFooter";
import { HtmlPreview } from "./HtmlPreview";

/**
 * HTML Playground - Uses GenericPlayground with custom output panel
 */
export function HtmlPlayground() {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  // Rendered inside the expanded output modal: close it so the preview panel
  // underneath becomes visible.
  const renderOutputActions = useCallback(
    ({ closeExpandedEditor }: { closeExpandedEditor: () => void }) => {
      return (
        <Button
          variant="cyan"
          onClick={() => {
            closeExpandedEditor();
            setShowPreview(true);
          }}
          aria-label={t("html.viewPreview")}
          title={t("html.viewPreview")}
        >
          <i className="fas fa-eye"></i>
        </Button>
      );
    },
    [t],
  );

  const renderOutputPanel = useCallback(
    (props: OutputPanelProps) => {
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
            <HtmlPreview source={props.output.trim() ? props.output : props.input} />
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
              {props.output && (
                <OutputActions
                  onCopyOutput={props.onCopyOutput}
                  onDownloadOutput={props.onDownloadOutput}
                  onExpand={props.expandOutput}
                  onUseOutputAsInput={props.onUseOutputAsInput}
                />
              )}
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
              isProcessing={props.isProcessing}
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

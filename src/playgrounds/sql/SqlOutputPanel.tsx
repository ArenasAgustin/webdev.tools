import { useTranslation } from "react-i18next";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { OutputActions } from "@/components/editor/OutputActions";
import { EditorFooter } from "@/components/common/EditorFooter";
import type { OutputPanelProps } from "../engines/types";

export interface SqlOutputPanelProps extends OutputPanelProps {
  actions?: {
    isExecuting?: boolean;
    isFirstRun?: boolean;
    [key: string]: unknown;
  };
}

/**
 * SQL output panel — four states:
 * - Loading: first run + executing → "Loading SQLite engine…"
 * - Error: error and no output → error banner
 * - Idle: no output, no error → placeholder hint
 * - Success: output present → Monaco read-only JSON viewer (with optional truncation banner)
 */
export function SqlOutputPanel(props: SqlOutputPanelProps) {
  const { t } = useTranslation();
  const {
    output,
    error,
    outputStats,
    comparisonBytes,
    expandOutput,
    onCopyOutput,
    onDownloadOutput,
    onUseOutputAsInput,
    actions,
  } = props;

  const isExecuting = actions?.isExecuting ?? false;
  const isFirstRun = actions?.isFirstRun ?? true;

  // Loading state: first run and currently executing
  if (isFirstRun && isExecuting) {
    return (
      <Panel title={t("sql.result")} icon="terminal" iconColor="green-400">
        <div
          className="flex h-full min-h-[220px] items-center justify-center"
          data-testid="sql-loading"
        >
          <div className="flex flex-col items-center gap-3 text-white/70">
            <i className="fas fa-spinner fa-spin text-2xl text-green-400" aria-hidden="true"></i>
            <span>{t("sql.loading")}</span>
          </div>
        </div>
      </Panel>
    );
  }

  // Error state
  if (error && !output) {
    return (
      <Panel
        title={t("sql.executionError")}
        icon="exclamation-triangle"
        iconColor="red-400"
        actions={
          <OutputActions
            onCopyOutput={onCopyOutput}
            onDownloadOutput={onDownloadOutput}
            onExpand={expandOutput}
            onUseOutputAsInput={onUseOutputAsInput}
          />
        }
        footer={
          <EditorFooter
            variant="output"
            value={error}
            error={error}
            isProcessing={false}
            stats={outputStats}
            comparisonBytes={comparisonBytes}
          />
        }
      >
        <div
          className="flex h-full min-h-[80px] flex-col gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-4"
          data-testid="sql-error-banner"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-red-400">
            <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
            <span>{t("sql.sqlError")}</span>
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm text-red-300">{error}</pre>
        </div>
      </Panel>
    );
  }

  // Idle state (no output, no error)
  if (!output) {
    return (
      <Panel title={t("sql.result")} icon="terminal" iconColor="green-400">
        <div className="flex h-full min-h-[220px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-white/40">
            <i className="fas fa-database text-2xl" aria-hidden="true"></i>
            <span className="text-sm">{t("editor.outputIdle")}</span>
          </div>
        </div>
      </Panel>
    );
  }

  // Success state — detect language from content
  let parsed: { truncated?: boolean } | null;
  try {
    parsed = JSON.parse(output) as { truncated?: boolean };
  } catch {
    parsed = null;
  }
  const isJsonOutput = parsed !== null;
  const isTruncated = parsed?.truncated === true;

  return (
    <Panel
      title={t("sql.result")}
      icon="terminal"
      iconColor="green-400"
      actions={
        <OutputActions
          onCopyOutput={onCopyOutput}
          onDownloadOutput={onDownloadOutput}
          onExpand={expandOutput}
          onUseOutputAsInput={onUseOutputAsInput}
        />
      }
      footer={
        <EditorFooter
          variant="output"
          value={output}
          error={null}
          isProcessing={false}
          stats={outputStats}
          comparisonBytes={comparisonBytes}
        />
      }
    >
      {isTruncated && (
        <div
          className="flex items-center gap-2 rounded-md border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-300"
          data-testid="sql-truncation-banner"
        >
          <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
          <span>{t("sql.truncated", { count: 1000 })}</span>
        </div>
      )}
      <LazyCodeEditor
        value={output}
        language={isJsonOutput ? "json" : "sql"}
        readOnly={true}
        placeholder={t("editor.outputPlaceholder")}
      />
    </Panel>
  );
}

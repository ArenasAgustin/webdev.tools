import { memo, useMemo, useState } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { JsInputActions } from "@/components/editor/JsInputActions";
import { JsOutputActions } from "@/components/editor/JsOutputActions";
import { Button } from "@/components/common/Button";
import { Stats } from "@/components/common/Stats";
import { OutputStatus } from "@/components/common/OutputStatus";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";

interface HtmlEditorsProps {
  inputHtml: string;
  output: string;
  error: string | null;
  validationState: {
    isValid: boolean;
    error: {
      message: string;
    } | null;
  };
  inputWarning?: string | null;
  onInputChange: (code: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

function HtmlValidationStatus({
  inputValue,
  validationState,
  warning,
}: {
  inputValue: string;
  validationState: {
    isValid: boolean;
    error: {
      message: string;
    } | null;
  };
  warning?: string | null;
}) {
  if (inputValue.trim() === "") {
    return (
      <span className="text-gray-400">
        Esperando HTML...
        {warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null}
      </span>
    );
  }

  if (validationState.isValid) {
    return (
      <span className="text-green-400 flex min-w-0 items-center gap-1">
        <i className="fas fa-check-circle"></i> HTML válido
        {warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null}
      </span>
    );
  }

  return (
    <span className="text-red-400 flex min-w-0 w-full items-center gap-1 overflow-hidden">
      <i className="fas fa-exclamation-circle"></i>
      <span
        className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
        title={validationState.error?.message ?? "HTML inválido"}
      >
        {validationState.error?.message ?? "HTML inválido"}
      </span>
      {warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null}
    </span>
  );
}

export const HtmlEditors = memo(function HtmlEditors({
  inputHtml,
  output,
  error,
  validationState,
  inputWarning,
  onInputChange,
  onClearInput,
  onLoadExample,
  onCopyOutput,
  onDownloadInput,
  onDownloadOutput,
}: HtmlEditorsProps) {
  const editor = useExpandedEditor();
  const inputStats = useTextStats(inputHtml);
  const [showPreview, setShowPreview] = useState(false);
  const previewSource = useMemo(() => (output.trim() ? output : inputHtml), [output, inputHtml]);
  const domInspection = useMemo(() => inspectDom(previewSource), [previewSource]);

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title="HTML"
          icon="code"
          iconColor="blue-400"
          actions={
            <JsInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <div className="text-xs h-4 min-w-0 overflow-hidden">
              <HtmlValidationStatus
                inputValue={inputHtml}
                validationState={validationState}
                warning={inputWarning}
              />
            </div>
          }
          value={inputHtml}
          language="html"
          onChange={onInputChange}
        />
      )}

      {editor.isExpanded("output") && (
        <ExpandedEditorModal
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <JsOutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <OutputStatus
              outputValue={output}
              outputError={error}
              showValidLabel={false}
              withWrapper
              className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              validExtra={
                <span className="text-gray-400">
                  Líneas: {output.split("\n").length} | Caracteres: {output.length}
                </span>
              }
            />
          }
          value={output}
          language="html"
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        <Panel
          title="HTML"
          icon="code"
          iconColor="blue-400"
          actions={
            <JsInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={() => editor.expand("input")}
            />
          }
          footer={
            <div className="text-xs h-4 min-w-0 overflow-hidden flex items-center gap-1">
              <HtmlValidationStatus
                inputValue={inputHtml}
                validationState={validationState}
                warning={inputWarning}
              />
              {validationState.isValid ? (
                <Stats
                  lines={inputStats.lines}
                  characters={inputStats.characters}
                  bytes={inputStats.bytes}
                />
              ) : null}
            </div>
          }
        >
          <LazyCodeEditor
            value={inputHtml}
            language="html"
            onChange={onInputChange}
            placeholder="Escribe tu HTML aquí..."
          />
        </Panel>

        {!showPreview ? (
          <Panel
            title="Resultado"
            icon="terminal"
            iconColor="green-400"
            actions={
              <>
                <JsOutputActions
                  onCopyOutput={onCopyOutput}
                  onDownloadOutput={onDownloadOutput}
                  onExpand={() => editor.expand("output")}
                />
                <Button
                  variant="cyan"
                  onClick={() => setShowPreview(true)}
                  aria-label="Ver vista previa"
                  title="Ver vista previa"
                >
                  <i className="fas fa-eye"></i>
                </Button>
              </>
            }
            footer={
              <OutputStatus
                outputValue={output}
                outputError={error}
                showValidLabel={false}
                withWrapper
                className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                validExtra={
                  <span className="text-gray-400">
                    Líneas: {output.split("\n").length} | Caracteres: {output.length}
                  </span>
                }
              />
            }
          >
            <LazyCodeEditor
              value={output}
              language="html"
              readOnly={true}
              placeholder="El resultado se mostrará aquí..."
            />
          </Panel>
        ) : (
          <Panel
            title="Vista previa"
            icon="eye"
            iconColor="cyan-400"
            actions={
              <Button
                variant="primary"
                onClick={() => setShowPreview(false)}
                aria-label="Ver resultado"
                title="Ver resultado"
              >
                <i className="fas fa-terminal"></i>
              </Button>
            }
          >
            <div className="flex h-full min-h-[220px] flex-col gap-2">
              <iframe
                title="Vista previa HTML"
                srcDoc={previewSource}
                sandbox="allow-scripts"
                className="h-full min-h-[150px] w-full rounded-lg border border-white/10 bg-white"
              />
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                <div className="mb-1 font-medium text-cyan-300">Inspección DOM</div>
                {domInspection ? (
                  <span data-testid="dom-inspection-summary">{domInspection}</span>
                ) : (
                  <span className="text-gray-400">Sin elementos para inspeccionar</span>
                )}
              </div>
            </div>
          </Panel>
        )}
      </main>
    </>
  );
});

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

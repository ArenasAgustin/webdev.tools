import { memo } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { JsInputActions } from "@/components/editor/JsInputActions";
import { JsOutputActions } from "@/components/editor/JsOutputActions";
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
      <span className="text-green-400 flex items-center gap-1">
        <i className="fas fa-check-circle"></i> HTML válido
        {warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null}
      </span>
    );
  }

  return (
    <span className="text-red-400 flex items-center gap-1">
      <i className="fas fa-exclamation-circle"></i>
      {validationState.error?.message ?? "HTML inválido"}
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
            <div className="text-xs h-4">
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
            <div className="text-xs h-4 flex items-center gap-1">
              <HtmlValidationStatus
                inputValue={inputHtml}
                validationState={validationState}
                warning={inputWarning}
              />
              <Stats
                lines={inputStats.lines}
                characters={inputStats.characters}
                bytes={inputStats.bytes}
              />
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

        <Panel
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <JsOutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={() => editor.expand("output")}
            />
          }
          footer={
            <OutputStatus
              outputValue={output}
              outputError={error}
              showValidLabel={false}
              withWrapper
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
      </main>
    </>
  );
});

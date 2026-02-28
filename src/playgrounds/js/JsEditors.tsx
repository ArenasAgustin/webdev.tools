import { memo } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { JsInputActions } from "@/components/editor/JsInputActions";
import { JsOutputActions } from "@/components/editor/JsOutputActions";
import { Stats } from "@/components/common/Stats";
import { ValidationStatus } from "@/components/common/ValidationStatus";
import { OutputStatus } from "@/components/common/OutputStatus";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";

interface JsEditorsProps {
  inputCode: string;
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

export const JsEditors = memo(function JsEditors({
  inputCode,
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
}: JsEditorsProps) {
  const editor = useExpandedEditor();

  const inputStats = useTextStats(inputCode);

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title="Código"
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
            <ValidationStatus
              inputValue={inputCode}
              validationState={validationState}
              warning={inputWarning}
              withWrapper
            />
          }
          value={inputCode}
          language="javascript"
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
          language="javascript"
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        {/* Input Panel */}
        <Panel
          title="Código"
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
            <ValidationStatus
              inputValue={inputCode}
              validationState={validationState}
              warning={inputWarning}
              withWrapper
              withFlex
              validExtra={
                <Stats
                  lines={inputStats.lines}
                  characters={inputStats.characters}
                  bytes={inputStats.bytes}
                />
              }
            />
          }
        >
          <LazyCodeEditor
            value={inputCode}
            language="javascript"
            onChange={onInputChange}
            placeholder="Escribe tu código JavaScript aquí..."
          />
        </Panel>

        {/* Output Panel */}
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
            language="javascript"
            readOnly={true}
            placeholder="El resultado se mostrará aquí..."
          />
        </Panel>
      </main>
    </>
  );
});

import { memo } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { InputActions } from "@/components/editor/InputActions";
import { OutputActions } from "@/components/editor/OutputActions";
import { Stats } from "@/components/common/Stats";
import { ValidationStatus } from "@/components/common/ValidationStatus";
import { OutputStatus } from "@/components/common/OutputStatus";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";
import type { JsonValidationState } from "./json.types";

interface JsonEditorsProps {
  inputJson: string;
  output: string;
  error: string | null;
  validationState: JsonValidationState;
  inputWarning?: string | null;
  onInputChange: (value: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

export const JsonEditors = memo(function JsonEditors({
  inputJson,
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
}: JsonEditorsProps) {
  const editor = useExpandedEditor();

  const inputStats = useTextStats(inputJson);
  const outputStats = useTextStats(output);

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title="JSON"
          icon="code"
          iconColor="blue-400"
          actions={
            <InputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <ValidationStatus
              inputValue={inputJson}
              validationState={validationState}
              warning={inputWarning}
              waitingLabel="Esperando JSON..."
              validLabel="JSON válido"
              invalidLabel="JSON inválido"
              withWrapper
              withFlex
              validExtra={
                <Stats
                  lines={inputStats.lines}
                  characters={inputStats.characters}
                  bytes={inputStats.bytes}
                  leadingSeparator
                />
              }
            />
          }
          value={inputJson}
          language="json"
          onChange={onInputChange}
        />
      )}

      {editor.isExpanded("output") && (
        <ExpandedEditorModal
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <OutputActions
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
                <Stats
                  lines={outputStats.lines}
                  characters={outputStats.characters}
                  bytes={outputStats.bytes}
                  comparisonBytes={inputStats.bytes}
                />
              }
            />
          }
          value={output}
          language="json"
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        {/* Input Panel */}
        <Panel
          title="JSON"
          icon="code"
          iconColor="blue-400"
          actions={
            <InputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={() => editor.expand("input")}
            />
          }
          footer={
            <ValidationStatus
              inputValue={inputJson}
              validationState={validationState}
              warning={inputWarning}
              waitingLabel="Esperando JSON..."
              validLabel="JSON válido"
              invalidLabel="JSON inválido"
              withWrapper
              withFlex
              validExtra={
                <Stats
                  lines={inputStats.lines}
                  characters={inputStats.characters}
                  bytes={inputStats.bytes}
                  leadingSeparator
                />
              }
            />
          }
        >
          <LazyCodeEditor
            value={inputJson}
            language="json"
            onChange={onInputChange}
            placeholder="Pega tu JSON aquí..."
          />
        </Panel>

        {/* Output Panel */}
        <Panel
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <OutputActions
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
              className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
              validExtra={
                <Stats
                  lines={outputStats.lines}
                  characters={outputStats.characters}
                  bytes={outputStats.bytes}
                  comparisonBytes={inputStats.bytes}
                />
              }
            />
          }
        >
          <LazyCodeEditor
            value={output}
            language="json"
            readOnly={true}
            placeholder="El resultado se mostrará aquí..."
          />
        </Panel>
      </main>
    </>
  );
});

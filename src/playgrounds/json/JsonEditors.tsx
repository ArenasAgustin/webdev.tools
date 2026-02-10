import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { JsonInputActions } from "@/components/editor/JsonInputActions";
import { JsonOutputActions } from "@/components/editor/JsonOutputActions";
import { Stats } from "@/components/common/Stats";
import { ValidationStatus } from "@/components/common/ValidationStatus";
import { OutputStatus } from "@/components/common/OutputStatus";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";
import type { JsonValidationState } from "./json.types";

interface JsonEditorsProps {
  inputValue: string;
  outputValue: string;
  validationState: JsonValidationState;
  outputError: string | null;
  onInputChange: (value: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

export function JsonEditors({
  inputValue,
  outputValue,
  validationState,
  outputError,
  onInputChange,
  onClearInput,
  onLoadExample,
  onCopyOutput,
  onDownloadInput,
  onDownloadOutput,
}: JsonEditorsProps) {
  const editor = useExpandedEditor();

  const inputStats = useTextStats(inputValue);
  const outputStats = useTextStats(outputValue);

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title="Entrada"
          icon="edit"
          iconColor="blue-400"
          actions={
            <JsonInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <ValidationStatus
              inputValue={inputValue}
              validationState={validationState}
              withWrapper
            />
          }
          value={inputValue}
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
            <JsonOutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <OutputStatus
              outputValue={outputValue}
              outputError={outputError}
              showValidLabel={false}
              withWrapper
              validExtra={
                <span className="text-gray-400">
                  Líneas: {outputValue.split("\n").length} | Caracteres:{" "}
                  {outputValue.length}
                </span>
              }
            />
          }
          value={outputValue}
          language="json"
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        {/* Input Panel */}
        <Panel
          title="Entrada"
          icon="edit"
          iconColor="blue-400"
          actions={
            <JsonInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={() => editor.expand("input")}
            />
          }
          footer={
            <ValidationStatus
              inputValue={inputValue}
              validationState={validationState}
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
            value={inputValue}
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
            <JsonOutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={() => editor.expand("output")}
            />
          }
          footer={
            <OutputStatus
              outputValue={outputValue}
              outputError={outputError}
              withWrapper
              withFlex
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
            value={outputValue}
            language="json"
            readOnly={true}
            placeholder="El resultado se mostrará aquí..."
          />
        </Panel>
      </main>
    </>
  );
}

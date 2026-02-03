import { Panel } from "@/components/layout/Panel";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { JsonInputActions } from "@/components/editor/JsonInputActions";
import { JsonOutputActions } from "@/components/editor/JsonOutputActions";
import { TextStats } from "@/components/common/TextStats";
import { OutputStats } from "@/components/common/OutputStats";
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

      <main className="grid md:grid-cols-2 gap-4 col-start-1 row-start-2">
        {/* Input Panel */}
        <Panel
          title="Entrada"
          icon="edit"
          iconColor="blue-400"
          actions={
            <JsonInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
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
                <TextStats
                  lines={inputStats.lines}
                  characters={inputStats.characters}
                  bytes={inputStats.bytes}
                />
              }
            />
          }
        >
          <CodeEditor
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
                <OutputStats
                  lines={outputStats.lines}
                  characters={outputStats.characters}
                  outputBytes={outputStats.bytes}
                  inputBytes={inputStats.bytes}
                />
              }
            />
          }
        >
          <CodeEditor
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

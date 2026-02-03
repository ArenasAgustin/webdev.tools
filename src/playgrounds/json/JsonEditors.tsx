import { useState } from "react";
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
  const [expandedEditor, setExpandedEditor] = useState<
    "input" | "output" | null
  >(null);

  const inputStats = useTextStats(inputValue);
  const outputStats = useTextStats(outputValue);

  return (
    <>
      {expandedEditor === "input" && (
        <ExpandedEditorModal
          title="Entrada"
          icon="edit"
          iconColor="blue-400"
          actions={
            <JsonInputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onExpand={() => setExpandedEditor(null)}
            />
          }
          footer={
            <div className="text-xs h-4">
              <ValidationStatus
                inputValue={inputValue}
                validationState={validationState}
              />
            </div>
          }
          value={inputValue}
          language="json"
          onChange={onInputChange}
        />
      )}

      {expandedEditor === "output" && (
        <ExpandedEditorModal
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <JsonOutputActions
              onCopyOutput={onCopyOutput}
              onExpand={() => setExpandedEditor(null)}
            />
          }
          footer={
            <div className="text-xs h-4">
              <OutputStatus
                outputValue={outputValue}
                outputError={outputError}
                showValidLabel={false}
                validExtra={
                  <span className="text-gray-400">
                    Líneas: {outputValue.split("\n").length} | Caracteres:{" "}
                    {outputValue.length}
                  </span>
                }
              />
            </div>
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
              onExpand={() => setExpandedEditor("input")}
            />
          }
          footer={
            <div className="text-xs h-4 flex items-center gap-1">
              <ValidationStatus
                inputValue={inputValue}
                validationState={validationState}
                validExtra={
                  <TextStats
                    lines={inputStats.lines}
                    characters={inputStats.characters}
                    bytes={inputStats.bytes}
                  />
                }
              />
            </div>
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
              onExpand={() => setExpandedEditor("output")}
            />
          }
          footer={
            <div className="text-xs h-4 flex items-center gap-1">
              <OutputStatus
                outputValue={outputValue}
                outputError={outputError}
                validExtra={
                  <OutputStats
                    lines={outputStats.lines}
                    characters={outputStats.characters}
                    outputBytes={outputStats.bytes}
                    inputBytes={inputStats.bytes}
                  />
                }
              />
            </div>
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

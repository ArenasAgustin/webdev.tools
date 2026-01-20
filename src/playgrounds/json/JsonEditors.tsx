import { Panel } from "@/components/layout/Panel";
import { Button } from "@/components/common/Button";
import { CodeEditor } from "@/components/editor/CodeEditor";
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
  return (
    <main className="grid lg:grid-cols-2 gap-4">
      {/* Input Panel */}
      <Panel
        title="Entrada"
        icon="edit"
        iconColor="blue-400"
        actions={
          <>
            <Button variant="danger" onClick={onClearInput}>
              <i className="fas fa-trash"></i> Limpiar
            </Button>
            <Button variant="success" onClick={onLoadExample}>
              <i className="fas fa-file-import"></i> Ejemplo
            </Button>
            <Button variant="purple">
              <i className="fas fa-expand"></i>
            </Button>
          </>
        }
        footer={
          <div className="text-xs h-4">
            {inputValue.trim() === "" ? (
              <span className="text-gray-400">Esperando JSON...</span>
            ) : validationState.isValid ? (
              <span className="text-green-400 flex items-center gap-1">
                <i className="fas fa-check-circle"></i> JSON válido
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>{" "}
                {validationState.error?.message || "JSON inválido"}
              </span>
            )}
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
          <>
            <Button variant="primary" onClick={onCopyOutput}>
              <i className="fas fa-copy"></i> Copiar
            </Button>
            <Button variant="purple">
              <i className="fas fa-expand"></i>
            </Button>
          </>
        }
        footer={
          <div className="text-xs h-4">
            {outputError ? (
              <span className="text-red-400 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i> {outputError}
              </span>
            ) : outputValue.trim() === "" ? (
              <span className="text-gray-400">Esperando operación...</span>
            ) : (
              <span className="text-gray-400">
                Líneas: {outputValue.split("\n").length} | Caracteres:{" "}
                {outputValue.length}
              </span>
            )}
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
  );
}

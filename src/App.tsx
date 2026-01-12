import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Panel } from "@/components/layout/Panel";
import { Toolbar } from "@/components/layout/Toolbar";
import { Button } from "@/components/common/Button";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { parseJson } from "@/services/json/parse";
import { formatJson } from "@/services/json/format";
import { minifyJson } from "@/services/json/minify";

function App() {
  const [inputJson, setInputJson] = useState("");
  const [outputJson, setOutputJson] = useState("");

  // Derive validation state from input - no effects needed
  const validation = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: false, error: null };
    }

    const result = parseJson(inputJson);
    if (result.ok) {
      return { isValid: true, error: null };
    } else {
      return { isValid: false, error: result.error };
    }
  }, [inputJson]);

  // Handler functions
  const handleFormat = () => {
    const result = formatJson(inputJson);
    if (result.ok) {
      setOutputJson(result.value);
    }
  };

  const handleMinify = () => {
    const result = minifyJson(inputJson);
    if (result.ok) {
      setOutputJson(result.value);
    }
  };

  const handleClean = () => {
    // TODO: Implement in future phase
    console.log("Limpiar vacíos - próximamente");
  };

  const handleFilter = () => {
    // TODO: Implement in phase 7
    console.log("Filtro JSONPath - próximamente");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-sm">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Header />

        {/* Main Content */}
        <main className="grid lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <Panel
            title="Entrada"
            icon="edit"
            iconColor="blue-400"
            actions={
              <>
                <Button variant="danger" onClick={() => setInputJson("")}>
                  <i className="fas fa-trash"></i> Limpiar
                </Button>
                <Button variant="success">
                  <i className="fas fa-file-import"></i> Ejemplo
                </Button>
                <Button variant="purple">
                  <i className="fas fa-expand"></i>
                </Button>
              </>
            }
            footer={
              <div className="text-xs h-4">
                {inputJson.trim() === "" ? (
                  <span className="text-gray-400">Esperando JSON...</span>
                ) : validation.isValid ? (
                  <span className="text-green-400 flex items-center gap-1">
                    <i className="fas fa-check-circle"></i> JSON válido
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>{" "}
                    {validation.error?.message || "JSON inválido"}
                  </span>
                )}
              </div>
            }
          >
            <CodeEditor
              value={inputJson}
              language="json"
              onChange={setInputJson}
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
                <Button variant="primary">
                  <i className="fas fa-copy"></i> Copiar
                </Button>
                <Button variant="purple">
                  <i className="fas fa-expand"></i>
                </Button>
              </>
            }
            footer={
              <div className="text-gray-400">
                Líneas: {outputJson.split("\n").length} | Caracteres:{" "}
                {outputJson.length}
              </div>
            }
          >
            <CodeEditor
              value={outputJson}
              language="json"
              readOnly={true}
              placeholder="El resultado se mostrará aquí..."
            />
          </Panel>
        </main>

        <Toolbar
          onFormat={handleFormat}
          onMinify={handleMinify}
          onClean={handleClean}
          onFilter={handleFilter}
        />
      </div>
    </div>
  );
}

export default App;

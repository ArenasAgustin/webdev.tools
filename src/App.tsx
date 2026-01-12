import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Panel } from "@/components/layout/Panel";
import { Toolbar } from "@/components/layout/Toolbar";
import { Button } from "@/components/common/Button";
import { CodeEditor } from "@/components/editor/CodeEditor";

function App() {
  const [inputJson, setInputJson] = useState("");
  const [outputJson] = useState("");

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
            footer={<div className="text-gray-400">Estado: Listo</div>}
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

        <Toolbar />
      </div>
    </div>
  );
}

export default App;

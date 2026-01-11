import { Header } from "@/components/layout/Header";
import { Panel } from "@/components/layout/Panel";
import { Toolbar } from "@/components/layout/Toolbar";
import { Button } from "@/components/common/Button";

function App() {
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
                <Button variant="danger">
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
            <textarea
              className="w-full h-64 p-3 bg-black/40 text-white rounded-lg resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-inner border border-white/10 text-xs font-mono"
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
              <div className="text-gray-400">Líneas: 0 | Caracteres: 0</div>
            }
          >
            <div className="w-full h-64 p-3 bg-black/40 text-white rounded-lg overflow-y-auto shadow-inner border border-white/10 text-xs font-mono whitespace-pre-wrap">
              {/* Output will be displayed here */}
            </div>
          </Panel>
        </main>

        <Toolbar />
      </div>
    </div>
  );
}

export default App;

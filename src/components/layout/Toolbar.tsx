import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import { TipsModal } from "@/components/common/TipsModal";
import type { TipItem, QuickExample } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

type ModalType = "tips" | "history" | "config" | null;

interface ToolbarProps {
  actions: {
    onFormat: () => void;
    onMinify: () => void;
    onClean: () => void;
    onFilter: () => void;
  };
  jsonPath: {
    value: string;
    onChange: (value: string) => void;
  };
  history?: {
    items: JsonPathHistoryItem[];
    onReuse: (expression: string) => void | Promise<void>;
    onDelete: (id: string) => void | Promise<void>;
    onClear: () => void | Promise<void>;
  };
  config: {
    format: FormatConfig;
    onFormatChange: (config: FormatConfig) => void;
    minify: MinifyConfig;
    onMinifyChange: (config: MinifyConfig) => void;
    clean: CleanConfig;
    onCleanChange: (config: CleanConfig) => void;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  };
  tips?: {
    config: {
      tips: TipItem[];
      quickExamples?: QuickExample[];
    };
    onShow?: () => void;
  };
}

export function Toolbar({
  actions,
  jsonPath,
  history,
  config,
  tips,
}: ToolbarProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // Use external state if provided, otherwise use local state
  const showConfig = config.isOpen ?? openModal === "config";
  const setShowConfigState = (isOpen: boolean) => {
    if (config.onOpenChange) {
      config.onOpenChange(isOpen);
    } else {
      setOpenModal(isOpen ? "config" : null);
    }
  };

  const handleShowTips = () => {
    if (!tips?.config) return;
    setOpenModal("tips");
    tips.onShow?.();
  };

  const handleShowHistory = () => {
    if (!history) return;
    setOpenModal("history");
  };

  return (
    <>
      <section className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-white/5 col-start-1 row-start-5">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Action Buttons */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fas fa-tools text-yellow-400"></i> Herramientas
              <button
                onClick={() => setShowConfigState(true)}
                className="ml-auto text-gray-400 hover:text-yellow-300 transition-colors"
                title="Configurar herramientas (Ctrl+,)"
              >
                <i className="fas fa-cog"></i>
              </button>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="primary" size="md" onClick={actions.onFormat}>
                <i className="fas fa-indent mr-1"></i> Formatear
              </Button>
              <Button variant="purple" size="md" onClick={actions.onMinify}>
                <i className="fas fa-compress mr-1"></i> Minificar
              </Button>
              <Button variant="orange" size="md" onClick={actions.onClean}>
                <i className="fas fa-broom mr-1"></i> Limpiar vacíos
              </Button>
            </div>
          </div>

          {/* Filter Section */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fas fa-filter text-cyan-400"></i> Filtro JSONPath
              <div className="ml-auto flex gap-2">
                <button
                  onClick={handleShowHistory}
                  className="text-gray-400 hover:text-cyan-300 transition-colors"
                  title="Historial de filtros"
                >
                  <i className="fas fa-history"></i>
                </button>
                <button
                  onClick={handleShowTips}
                  className="text-gray-400 hover:text-cyan-300 transition-colors"
                  title="Ver tips de filtros"
                >
                  <i className="fas fa-question-circle"></i>
                </button>
              </div>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={jsonPath.value}
                onChange={(e) => jsonPath.onChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
                placeholder="Ej: $.users[0].name"
              />
              <Button variant="cyan" size="md" onClick={actions.onFilter}>
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Modal */}
      {tips?.config && (
        <TipsModal
          isOpen={openModal === "tips"}
          title="Tips para Filtros JSONPath"
          icon="lightbulb"
          iconColor="yellow-400"
          tips={tips.config.tips}
          quickExamples={tips.config.quickExamples}
          onClose={() => setOpenModal(null)}
          onTryExample={(code) => {
            jsonPath.onChange(code);
            setOpenModal(null);
          }}
        />
      )}

      {/* History Modal */}
      {history && (
        <JsonPathHistoryModal
          isOpen={openModal === "history"}
          history={history.items}
          onClose={() => setOpenModal(null)}
          onReuse={(expression) => {
            history.onReuse(expression);
            setOpenModal(null);
          }}
          onDelete={history.onDelete}
          onClearAll={history.onClear}
        />
      )}

      {/* Config Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfigState(false)}
        formatConfig={config.format}
        onFormatConfigChange={config.onFormatChange}
        minifyConfig={config.minify}
        onMinifyConfigChange={config.onMinifyChange}
        cleanConfig={config.clean}
        onCleanConfigChange={config.onCleanChange}
      />
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import { TipsModal } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onClean: () => void;
  onFilter: () => void;
  jsonPathValue: string;
  onJsonPathChange: (value: string) => void;
  jsonPathHistory?: JsonPathHistoryItem[];
  onHistoryReuse?: (expression: string) => void | Promise<void>;
  onHistoryDelete?: (id: string) => void | Promise<void>;
  onHistoryClear?: () => void | Promise<void>;
  formatConfig: FormatConfig;
  onFormatConfigChange: (config: FormatConfig) => void;
  minifyConfig: MinifyConfig;
  onMinifyConfigChange: (config: MinifyConfig) => void;
  cleanConfig: CleanConfig;
  onCleanConfigChange: (config: CleanConfig) => void;
  configIsOpen?: boolean;
  onConfigOpen?: (isOpen: boolean) => void;
  onShowTips?: () => void;
  tipsConfig?: {
    tips: Array<{
      id: string;
      category: string;
      categoryIcon?: string;
      categoryColor?: string;
      items: Array<{ code: string; description: string }>;
    }>;
    quickExamples?: Array<{ code: string; label: string; description: string }>;
  };
}

export function Toolbar({
  onFormat,
  onMinify,
  onClean,
  onFilter,
  jsonPathValue,
  onJsonPathChange,
  jsonPathHistory,
  onHistoryReuse,
  onHistoryDelete,
  onHistoryClear,
  formatConfig,
  onFormatConfigChange,
  minifyConfig,
  onMinifyConfigChange,
  cleanConfig,
  onCleanConfigChange,
  configIsOpen,
  onConfigOpen,
  onShowTips,
  tipsConfig,
}: ToolbarProps) {
  const [showTips, setShowTips] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [localShowConfig, setLocalShowConfig] = useState(configIsOpen || false);

  // Use external state if provided, otherwise use local state
  const showConfig = configIsOpen ?? localShowConfig;
  const setShowConfigState = onConfigOpen ?? setLocalShowConfig;

  const handleShowTips = () => {
    setShowTips(true);
    onShowTips?.();
  };

  const handleShowHistory = () => {
    setShowHistory(true);
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
              <Button variant="primary" size="md" onClick={onFormat}>
                <i className="fas fa-indent mr-1"></i> Formatear
              </Button>
              <Button variant="purple" size="md" onClick={onMinify}>
                <i className="fas fa-compress mr-1"></i> Minificar
              </Button>
              <Button variant="orange" size="md" onClick={onClean}>
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
                value={jsonPathValue}
                onChange={(e) => onJsonPathChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
                placeholder="Ej: $.users[0].name"
              />
              <Button variant="cyan" size="md" onClick={onFilter}>
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Modal */}
      {tipsConfig && (
        <TipsModal
          isOpen={showTips}
          title="Tips para Filtros JSONPath"
          icon="lightbulb"
          iconColor="yellow-400"
          tips={tipsConfig.tips}
          quickExamples={tipsConfig.quickExamples}
          onClose={() => setShowTips(false)}
          onTryExample={(code) => {
            onJsonPathChange(code);
            setShowTips(false);
          }}
        />
      )}

      {/* History Modal */}
      {jsonPathHistory &&
        onHistoryReuse &&
        onHistoryDelete &&
        onHistoryClear && (
          <JsonPathHistoryModal
            isOpen={showHistory}
            history={jsonPathHistory}
            onClose={() => setShowHistory(false)}
            onReuse={(expression) => {
              onHistoryReuse(expression);
              setShowHistory(false);
            }}
            onDelete={onHistoryDelete}
            onClearAll={onHistoryClear}
          />
        )}

      {/* Config Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfigState(false)}
        formatConfig={formatConfig}
        onFormatConfigChange={onFormatConfigChange}
        minifyConfig={minifyConfig}
        onMinifyConfigChange={onMinifyConfigChange}
        cleanConfig={cleanConfig}
        onCleanConfigChange={onCleanConfigChange}
      />
    </>
  );
}

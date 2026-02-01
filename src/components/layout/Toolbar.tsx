import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import { TipsModal } from "@/components/common/TipsModal";

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onClean: () => void;
  onFilter: () => void;
  jsonPathValue: string;
  onJsonPathChange: (value: string) => void;
  formatConfig: {
    indent: number | "\t";
    sortKeys: boolean;
    autoCopy: boolean;
  };
  onFormatConfigChange: (config: {
    indent: number | "\t";
    sortKeys: boolean;
    autoCopy: boolean;
  }) => void;
  minifyConfig: {
    removeSpaces: boolean;
    sortKeys: boolean;
    autoCopy: boolean;
  };
  onMinifyConfigChange: (config: {
    removeSpaces: boolean;
    sortKeys: boolean;
    autoCopy: boolean;
  }) => void;
  cleanConfig: {
    removeNull: boolean;
    removeUndefined: boolean;
    removeEmptyString: boolean;
    removeEmptyArray: boolean;
    removeEmptyObject: boolean;
    outputFormat: "format" | "minify";
    autoCopy: boolean;
  };
  onCleanConfigChange: (config: {
    removeNull: boolean;
    removeUndefined: boolean;
    removeEmptyString: boolean;
    removeEmptyArray: boolean;
    removeEmptyObject: boolean;
    outputFormat: "format" | "minify";
    autoCopy: boolean;
  }) => void;
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
  formatConfig,
  onFormatConfigChange,
  minifyConfig,
  onMinifyConfigChange,
  cleanConfig,
  onCleanConfigChange,
  onShowTips,
  tipsConfig,
}: ToolbarProps) {
  const [showTips, setShowTips] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleShowTips = () => {
    setShowTips(true);
    onShowTips?.();
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
                onClick={() => setShowConfig(true)}
                className="ml-auto text-gray-400 hover:text-yellow-300 transition-colors"
                title="Configurar herramientas"
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
              <button
                onClick={handleShowTips}
                className="ml-auto text-gray-400 hover:text-cyan-300 transition-colors"
                title="Ver tips de filtros"
              >
                <i className="fas fa-question-circle"></i>
              </button>
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

      {/* Config Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
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

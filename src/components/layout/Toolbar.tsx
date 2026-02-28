import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import { TipsModal } from "@/components/common/TipsModal";
import type { TipItem, QuickExample } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import type { ToolbarConfig } from "@/types/toolbar";

type ModalType = "tips" | "history" | "config" | null;

export interface JsonToolbarProps {
  variant: "json";
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

export interface GenericToolbarProps {
  variant: "generic";
  tools: ToolbarConfig;
  config?: {
    mode: "js";
    format: JsFormatConfig;
    onFormatChange: (config: JsFormatConfig) => void;
    minify: JsMinifyConfig;
    onMinifyChange: (config: JsMinifyConfig) => void;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  };
}

type ToolbarProps = JsonToolbarProps | GenericToolbarProps;

export function Toolbar(props: ToolbarProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  if (props.variant === "generic") {
    const toolsTitle = props.tools.title ?? "Herramientas";
    const toolsGridClass = props.tools.gridClassName ?? "grid grid-cols-2 sm:grid-cols-3 gap-2";
    const genericConfig = props.config;
    const showGenericConfig = genericConfig
      ? (genericConfig.isOpen ?? openModal === "config")
      : false;
    const setShowGenericConfigState = (isOpen: boolean) => {
      if (!genericConfig) {
        props.tools.onOpenConfig?.();
        return;
      }

      if (genericConfig.onOpenChange) {
        genericConfig.onOpenChange(isOpen);
      } else {
        setOpenModal(isOpen ? "config" : null);
      }
    };

    return (
      <>
        <section className="mt-2 sm:mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/5 sticky bottom-0 z-10 shrink-0">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <i className="fas fa-tools text-yellow-400"></i> {toolsTitle}
                {(props.tools.onOpenConfig ?? genericConfig) && (
                  <button
                    type="button"
                    onClick={() => setShowGenericConfigState(true)}
                    className="ml-auto text-gray-300 hover:text-yellow-300 transition-colors"
                    title={props.tools.configButtonTitle ?? "Configurar herramientas"}
                    aria-label={props.tools.configButtonTitle ?? "Configurar herramientas"}
                  >
                    <i className="fas fa-cog" aria-hidden="true"></i>
                  </button>
                )}
              </h3>
              <div className={toolsGridClass}>
                {props.tools.actions.map((action) => (
                  <Button
                    key={action.id ?? action.label}
                    variant={action.variant}
                    size="md"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    title={action.tooltip ?? action.label}
                    aria-label={action.tooltip ?? action.label}
                  >
                    {action.loading ? (
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                    ) : (
                      <i className={`fas fa-${action.icon} mr-1`}></i>
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {genericConfig && (
          <ConfigModal
            mode="js"
            isOpen={showGenericConfig}
            onClose={() => setShowGenericConfigState(false)}
            formatConfig={genericConfig.format}
            onFormatConfigChange={genericConfig.onFormatChange}
            minifyConfig={genericConfig.minify}
            onMinifyConfigChange={genericConfig.onMinifyChange}
          />
        )}
      </>
    );
  }

  const { actions, jsonPath, history, config, tips } = props;

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
      <section className="mt-2 sm:mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/5 sticky bottom-0 z-10 shrink-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Action Buttons */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <i className="fas fa-tools text-yellow-400"></i> Herramientas
              <button
                type="button"
                onClick={() => setShowConfigState(true)}
                className="ml-auto text-gray-300 hover:text-yellow-300 transition-colors"
                title="Configurar herramientas (Ctrl+,)"
                aria-label="Configurar herramientas"
              >
                <i className="fas fa-cog" aria-hidden="true"></i>
              </button>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  type="button"
                  onClick={handleShowHistory}
                  className="text-gray-300 hover:text-cyan-300 transition-colors"
                  title="Historial de filtros"
                  aria-label="Historial de filtros"
                >
                  <i className="fas fa-history" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  onClick={handleShowTips}
                  className="text-gray-300 hover:text-cyan-300 transition-colors"
                  title="Ver tips de filtros"
                  aria-label="Ver tips de filtros"
                >
                  <i className="fas fa-question-circle" aria-hidden="true"></i>
                </button>
              </div>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={jsonPath.value}
                onChange={(e) => jsonPath.onChange(e.target.value)}
                aria-label="Expresion JSONPath"
                className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
                placeholder="Ej: $.users[0].name"
              />
              <Button
                variant="cyan"
                size="md"
                onClick={actions.onFilter}
                aria-label="Aplicar filtro JSONPath"
                title="Aplicar filtro JSONPath"
              >
                <i className="fas fa-search" aria-hidden="true"></i>
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

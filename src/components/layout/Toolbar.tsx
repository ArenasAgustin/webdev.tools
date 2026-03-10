import { useState } from "react";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import type { ToolbarConfig } from "@/types/toolbar";

export interface ToolbarProps {
  variant: "generic";
  tools: ToolbarConfig;
  extraContent?: React.ReactNode;
  config?:
    | {
        mode: "json";
        format: JsonFormatConfig;
        onFormatChange: (config: JsonFormatConfig) => void;
        minify: JsonMinifyConfig;
        onMinifyChange: (config: JsonMinifyConfig) => void;
        clean: JsonCleanConfig;
        onCleanChange: (config: JsonCleanConfig) => void;
        isOpen?: boolean;
        onOpenChange?: (isOpen: boolean) => void;
      }
    | {
        mode: "js";
        format: JsFormatConfig;
        onFormatChange: (config: JsFormatConfig) => void;
        minify: JsMinifyConfig;
        onMinifyChange: (config: JsMinifyConfig) => void;
        isOpen?: boolean;
        onOpenChange?: (isOpen: boolean) => void;
      }
    | {
        mode: "html";
        format: HtmlFormatConfig;
        onFormatChange: (config: HtmlFormatConfig) => void;
        minify: HtmlMinifyConfig;
        onMinifyChange: (config: HtmlMinifyConfig) => void;
        isOpen?: boolean;
        onOpenChange?: (isOpen: boolean) => void;
      }
    | {
        mode: "css";
        format: CssFormatConfig;
        onFormatChange: (config: CssFormatConfig) => void;
        minify: CssMinifyConfig;
        onMinifyChange: (config: CssMinifyConfig) => void;
        isOpen?: boolean;
        onOpenChange?: (isOpen: boolean) => void;
      };
}

export function Toolbar(props: ToolbarProps) {
  const [openModal, setOpenModal] = useState<"config" | null>(null);

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

  const gridLayoutClass = props.extraContent
    ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
    : "grid grid-cols-1 gap-4 sm:gap-6";

  return (
    <>
      <section className="mt-2 sm:mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/5 sticky bottom-0 z-10 shrink-0">
        <div className={gridLayoutClass}>
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
          {props.extraContent}
        </div>
      </section>

      {genericConfig?.mode === "json" && (
        <ConfigModal
          isOpen={showGenericConfig}
          onClose={() => setShowGenericConfigState(false)}
          formatConfig={genericConfig.format}
          onFormatConfigChange={genericConfig.onFormatChange}
          minifyConfig={genericConfig.minify}
          onMinifyConfigChange={genericConfig.onMinifyChange}
          cleanConfig={genericConfig.clean}
          onCleanConfigChange={genericConfig.onCleanChange}
        />
      )}

      {genericConfig?.mode === "js" && (
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

      {genericConfig?.mode === "html" && (
        <ConfigModal
          mode="html"
          isOpen={showGenericConfig}
          onClose={() => setShowGenericConfigState(false)}
          formatConfig={genericConfig.format}
          onFormatConfigChange={genericConfig.onFormatChange}
          minifyConfig={genericConfig.minify}
          onMinifyConfigChange={genericConfig.onMinifyChange}
        />
      )}

      {genericConfig?.mode === "css" && (
        <ConfigModal
          mode="css"
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

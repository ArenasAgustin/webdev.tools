import { useState } from "react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/common/Button";
import { ConfigModal } from "@/components/common/ConfigModal";
import { ShortcutsModal } from "@/components/common/ShortcutsModal";
import type { ModalState } from "@/hooks/useModalState";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import type { ToolbarConfig } from "@/types/toolbar";

export interface ToolbarProps {
  variant: "generic";
  tools: ToolbarConfig;
  extraContent?: React.ReactNode;
  /** State for the keyboard shortcuts modal */
  shortcuts?: ModalState;
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const hasClean = props.config?.mode === "json";

  const toolsTitle = props.tools.title ?? "Herramientas";
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
        {/* Header row — always visible, acts as mobile toggle tap target */}
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            isMobileOpen ? "mb-3" : "mb-0 sm:mb-3",
          )}
        >
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <i className="fas fa-tools text-yellow-400" aria-hidden="true"></i>
            {toolsTitle}
          </h3>
          <div className="flex items-center gap-2">
            {props.tools.onOpenShortcuts && (
              <button
                type="button"
                onClick={props.tools.onOpenShortcuts}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-yellow-300 transition-colors"
                title="Atajos de teclado (?)"
                aria-label="Ver atajos de teclado"
              >
                <i className="fas fa-keyboard" aria-hidden="true"></i>
              </button>
            )}
            {props.tools.onOpenDiff && (
              <button
                type="button"
                onClick={props.tools.onOpenDiff}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-purple-300 transition-colors"
                title="Ver diferencias input/output"
                aria-label="Ver diferencias input/output"
              >
                <i className="fas fa-code-compare" aria-hidden="true"></i>
              </button>
            )}
            {(props.tools.onOpenConfig ?? genericConfig) && (
              <button
                type="button"
                onClick={() => setShowGenericConfigState(true)}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-yellow-300 transition-colors"
                title={props.tools.configButtonTitle ?? "Configurar herramientas"}
                aria-label={props.tools.configButtonTitle ?? "Configurar herramientas"}
              >
                <i className="fas fa-cog" aria-hidden="true"></i>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsMobileOpen((v) => !v)}
              className="sm:hidden inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-white transition-colors"
              aria-label={isMobileOpen ? "Ocultar herramientas" : "Mostrar herramientas"}
            >
              <i
                className={`fas fa-chevron-${isMobileOpen ? "down" : "up"}`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>

        {/* Buttons grid — hidden on mobile when collapsed, always visible on sm+ */}
        <div className={gridLayoutClass}>
          <div
            className={cn(
              isMobileOpen ? "grid" : "hidden sm:grid",
              props.tools.gridClassName ?? "grid-cols-2 sm:grid-cols-3 gap-2",
            )}
          >
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
          {props.extraContent && (
            <div className={cn(!isMobileOpen && "hidden sm:block")}>{props.extraContent}</div>
          )}
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

      {props.shortcuts && (
        <ShortcutsModal
          isOpen={props.shortcuts.isOpen}
          onClose={props.shortcuts.close}
          hasClean={hasClean}
        />
      )}
    </>
  );
}

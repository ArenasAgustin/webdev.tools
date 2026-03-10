import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Checkbox } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import type { CssFormatConfig, CssMinifyConfig } from "@/types/css";
import { INDENT_OPTIONS } from "@/types/format";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";
import { DEFAULT_HTML_FORMAT_CONFIG, DEFAULT_HTML_MINIFY_CONFIG } from "@/types/html";
import { DEFAULT_CSS_FORMAT_CONFIG, DEFAULT_CSS_MINIFY_CONFIG } from "@/types/css";
import {
  saveJsonToolsConfig,
  removeJsonToolsConfig,
  saveJsToolsConfig,
  removeJsToolsConfig,
  saveHtmlToolsConfig,
  removeHtmlToolsConfig,
  saveCssToolsConfig,
  removeCssToolsConfig,
} from "@/services/storage";

interface JsonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "json";
  formatConfig: JsonFormatConfig;
  onFormatConfigChange: (config: JsonFormatConfig) => void;
  minifyConfig: JsonMinifyConfig;
  onMinifyConfigChange: (config: JsonMinifyConfig) => void;
  cleanConfig: JsonCleanConfig;
  onCleanConfigChange: (config: JsonCleanConfig) => void;
}

interface JsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "js";
  formatConfig: JsFormatConfig;
  onFormatConfigChange: (config: JsFormatConfig) => void;
  minifyConfig: JsMinifyConfig;
  onMinifyConfigChange: (config: JsMinifyConfig) => void;
}

interface HtmlConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "html";
  formatConfig: HtmlFormatConfig;
  onFormatConfigChange: (config: HtmlFormatConfig) => void;
  minifyConfig: HtmlMinifyConfig;
  onMinifyConfigChange: (config: HtmlMinifyConfig) => void;
}

interface CssConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "css";
  formatConfig: CssFormatConfig;
  onFormatConfigChange: (config: CssFormatConfig) => void;
  minifyConfig: CssMinifyConfig;
  onMinifyConfigChange: (config: CssMinifyConfig) => void;
}

type ConfigModalProps =
  | JsonConfigModalProps
  | JsConfigModalProps
  | HtmlConfigModalProps
  | CssConfigModalProps;

const MODE_LABELS: Record<string, string> = {
  json: "JSON",
  js: "JavaScript",
  html: "HTML",
  css: "CSS",
};

export function ConfigModal(props: ConfigModalProps) {
  const mode = props.mode ?? "json";
  const modeLabel = MODE_LABELS[mode];

  // Narrowed accessors for mode-specific UI sections
  const jsonProps = mode === "json" ? (props as JsonConfigModalProps) : null;
  const htmlProps = mode === "html" ? (props as HtmlConfigModalProps) : null;
  const jsCssProps =
    mode === "js" || mode === "css" ? (props as JsConfigModalProps | CssConfigModalProps) : null;

  // Helpers for fields shared by all config variants.
  // Safe: spreading the current config with common-field patches
  // preserves the original type shape at runtime.
  const updateFormat = (patch: Record<string, unknown>) =>
    // @ts-expect-error union-of-functions TS limitation
    props.onFormatConfigChange({ ...props.formatConfig, ...patch });
  const updateMinify = (patch: Record<string, unknown>) =>
    // @ts-expect-error union-of-functions TS limitation
    props.onMinifyConfigChange({ ...props.minifyConfig, ...patch });

  const handleReset = () => {
    if (props.mode === "js") {
      props.onFormatConfigChange(DEFAULT_JS_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_JS_MINIFY_CONFIG);
      removeJsToolsConfig();
    } else if (props.mode === "html") {
      props.onFormatConfigChange(DEFAULT_HTML_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_HTML_MINIFY_CONFIG);
      removeHtmlToolsConfig();
    } else if (props.mode === "css") {
      props.onFormatConfigChange(DEFAULT_CSS_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_CSS_MINIFY_CONFIG);
      removeCssToolsConfig();
    } else {
      props.onFormatConfigChange(DEFAULT_JSON_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_JSON_MINIFY_CONFIG);
      props.onCleanConfigChange(DEFAULT_JSON_CLEAN_CONFIG);
      removeJsonToolsConfig();
    }
  };

  const handleClose = () => {
    if (props.mode === "js") {
      saveJsToolsConfig({ format: props.formatConfig, minify: props.minifyConfig });
    } else if (props.mode === "html") {
      saveHtmlToolsConfig({ format: props.formatConfig, minify: props.minifyConfig });
    } else if (props.mode === "css") {
      saveCssToolsConfig({ format: props.formatConfig, minify: props.minifyConfig });
    } else {
      saveJsonToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
        clean: props.cleanConfig,
      });
    }
    props.onClose();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      title={`Configuración de Herramientas ${modeLabel}`}
      icon="cog"
      iconColor="yellow-400"
      maxWidth="max-w-3xl"
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleReset}>
            <i className="fas fa-undo"></i> Restablecer
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        {/* Formatear */}
        <Card
          title={`Formatear ${modeLabel}`}
          icon="indent"
          className="bg-blue-500/10 border-blue-500/20"
          headerClassName="text-blue-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Espaciado</label>
              <ToggleButtonGroup
                options={INDENT_OPTIONS}
                value={props.formatConfig.indentSize}
                onChange={(indentSize) => updateFormat({ indentSize })}
              />
            </div>

            {jsonProps && (
              <div>
                <label className="block text-gray-300 mb-1">Ordenar claves alfabéticamente</label>
                <Checkbox
                  checked={jsonProps.formatConfig.sortKeys}
                  onChange={(checked) => updateFormat({ sortKeys: checked })}
                  label="Habilitar ordenamiento"
                  color="blue"
                />
              </div>
            )}

            {htmlProps && (
              <div>
                <label className="block text-gray-300 mb-1">Formato embebido</label>
                <div className="space-y-2">
                  <Checkbox
                    checked={htmlProps.formatConfig.formatCss}
                    onChange={(checked) => updateFormat({ formatCss: checked })}
                    label="Formatear CSS en &lt;style&gt;"
                    color="blue"
                  />
                  <Checkbox
                    checked={htmlProps.formatConfig.formatJs}
                    onChange={(checked) => updateFormat({ formatJs: checked })}
                    label="Formatear JS en &lt;script&gt;"
                    color="blue"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente al formatear
              </label>
              <Checkbox
                checked={props.formatConfig.autoCopy}
                onChange={(checked) => updateFormat({ autoCopy: checked })}
                label="Habilitar auto-copia"
                color="blue"
              />
            </div>
          </div>
        </Card>

        {/* Minificar */}
        <Card
          title={`Minificar ${modeLabel}`}
          icon="compress"
          className="bg-purple-500/10 border-purple-500/20"
          headerClassName="text-purple-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Opciones de minificación</label>
              <div className="space-y-2">
                {jsCssProps && (
                  <>
                    <Checkbox
                      checked={jsCssProps.minifyConfig.removeComments}
                      onChange={(checked) => updateMinify({ removeComments: checked })}
                      label="Eliminar comentarios"
                      color="purple"
                    />
                    <Checkbox
                      checked={jsCssProps.minifyConfig.removeSpaces}
                      onChange={(checked) => updateMinify({ removeSpaces: checked })}
                      label="Eliminar espacios"
                      color="purple"
                    />
                  </>
                )}

                {htmlProps && (
                  <>
                    <Checkbox
                      checked={htmlProps.minifyConfig.removeComments}
                      onChange={(checked) => updateMinify({ removeComments: checked })}
                      label="Eliminar comentarios"
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.collapseWhitespace}
                      onChange={(checked) => updateMinify({ collapseWhitespace: checked })}
                      label="Colapsar espacios"
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.minifyCss}
                      onChange={(checked) => updateMinify({ minifyCss: checked })}
                      label="Minificar CSS inline"
                      color="purple"
                    />
                    <Checkbox
                      checked={htmlProps.minifyConfig.minifyJs}
                      onChange={(checked) => updateMinify({ minifyJs: checked })}
                      label="Minificar JS inline"
                      color="purple"
                    />
                  </>
                )}

                {jsonProps && (
                  <>
                    <Checkbox
                      checked={jsonProps.minifyConfig.removeSpaces}
                      onChange={(checked) => updateMinify({ removeSpaces: checked })}
                      label="Eliminar todos los espacios"
                      color="purple"
                    />
                    <Checkbox
                      checked={jsonProps.minifyConfig.sortKeys}
                      onChange={(checked) => updateMinify({ sortKeys: checked })}
                      label="Ordenar claves alfabéticamente"
                      color="purple"
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Copiar automáticamente</label>
              <Checkbox
                checked={props.minifyConfig.autoCopy}
                onChange={(checked) => updateMinify({ autoCopy: checked })}
                label="Habilitar auto-copia"
                color="purple"
              />
            </div>
          </div>
        </Card>

        {/* Limpiar vacíos */}
        {jsonProps && (
          <Card
            title="Limpiar Valores Vacíos"
            icon="broom"
            className="bg-orange-500/10 border-orange-500/20"
            headerClassName="text-orange-400"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 mb-2">Valores a eliminar</label>
                <div className="grid grid-cols-2 gap-2">
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeNull}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeNull: checked,
                      })
                    }
                    label="null"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeUndefined}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeUndefined: checked,
                      })
                    }
                    label="undefined"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyString}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyString: checked,
                      })
                    }
                    label='"" (vacío)'
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyArray}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyArray: checked,
                      })
                    }
                    label="[] (array vacío)"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={jsonProps.cleanConfig.removeEmptyObject}
                    onChange={(checked) =>
                      jsonProps.onCleanConfigChange({
                        ...jsonProps.cleanConfig,
                        removeEmptyObject: checked,
                      })
                    }
                    label="{} (objeto vacío)"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Formato de salida</label>
                <RadioGroup
                  name="cleanOutputMode"
                  value={jsonProps.cleanConfig.outputFormat}
                  options={[
                    { value: "format", label: "Formatear" },
                    { value: "minify", label: "Minificar" },
                  ]}
                  onChange={(value) =>
                    jsonProps.onCleanConfigChange({ ...jsonProps.cleanConfig, outputFormat: value })
                  }
                  color="orange"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Copiar automáticamente</label>
                <Checkbox
                  checked={jsonProps.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    jsonProps.onCleanConfigChange({ ...jsonProps.cleanConfig, autoCopy: checked })
                  }
                  label="Habilitar auto-copia"
                  color="orange"
                />
              </div>
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}

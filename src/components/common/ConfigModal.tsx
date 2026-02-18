import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Checkbox } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import { DEFAULT_FORMAT_CONFIG, DEFAULT_MINIFY_CONFIG, DEFAULT_CLEAN_CONFIG } from "@/types/json";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";
import {
  saveToolsConfig,
  removeToolsConfig,
  saveJsToolsConfig,
  removeJsToolsConfig,
} from "@/services/storage";

interface JsonConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "json";
  formatConfig: FormatConfig;
  onFormatConfigChange: (config: FormatConfig) => void;
  minifyConfig: MinifyConfig;
  onMinifyConfigChange: (config: MinifyConfig) => void;
  cleanConfig: CleanConfig;
  onCleanConfigChange: (config: CleanConfig) => void;
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

type ConfigModalProps = JsonConfigModalProps | JsConfigModalProps;

export function ConfigModal(props: ConfigModalProps) {
  const isJsMode = props.mode === "js";

  const handleReset = () => {
    if (isJsMode) {
      props.onFormatConfigChange(DEFAULT_JS_FORMAT_CONFIG);
      props.onMinifyConfigChange(DEFAULT_JS_MINIFY_CONFIG);
      removeJsToolsConfig();
      return;
    }

    props.onFormatConfigChange(DEFAULT_FORMAT_CONFIG);
    props.onMinifyConfigChange(DEFAULT_MINIFY_CONFIG);
    props.onCleanConfigChange(DEFAULT_CLEAN_CONFIG);
    removeToolsConfig();
  };

  const handleClose = () => {
    if (isJsMode) {
      saveJsToolsConfig({
        format: props.formatConfig,
        minify: props.minifyConfig,
      });
      props.onClose();
      return;
    }

    saveToolsConfig({
      format: props.formatConfig,
      minify: props.minifyConfig,
      clean: props.cleanConfig,
    });
    props.onClose();
  };

  return (
    <Modal
      isOpen={props.isOpen}
      title={isJsMode ? "Configuración de Herramientas JS" : "Configuración de Herramientas"}
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
          title={isJsMode ? "Formatear JavaScript" : "Formatear JSON"}
          icon="indent"
          className="bg-blue-500/10 border-blue-500/20"
          headerClassName="text-blue-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Espaciado</label>
              {isJsMode ? (
                <ToggleButtonGroup
                  options={[
                    { value: 2, label: "2 espacios" },
                    { value: 4, label: "4 espacios" },
                  ]}
                  value={props.formatConfig.indentSize}
                  onChange={(indentSize) =>
                    props.onFormatConfigChange({
                      ...props.formatConfig,
                      indentSize,
                    })
                  }
                />
              ) : (
                <ToggleButtonGroup
                  options={[
                    { value: 2, label: "2 espacios" },
                    { value: 4, label: "4 espacios" },
                    { value: "\t", label: "Tab" },
                  ]}
                  value={props.formatConfig.indent}
                  onChange={(indent) =>
                    props.onFormatConfigChange({
                      ...props.formatConfig,
                      indent,
                    })
                  }
                />
              )}
            </div>

            {!isJsMode && (
              <div>
                <label className="block text-gray-300 mb-1">Ordenar claves alfabéticamente</label>
                <Checkbox
                  checked={props.formatConfig.sortKeys}
                  onChange={(checked) =>
                    props.onFormatConfigChange({
                      ...props.formatConfig,
                      sortKeys: checked,
                    })
                  }
                  label="Habilitar ordenamiento"
                  color="blue"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente al formatear
              </label>
              {isJsMode ? (
                <Checkbox
                  checked={props.formatConfig.autoCopy}
                  onChange={(checked) =>
                    props.onFormatConfigChange({
                      ...props.formatConfig,
                      autoCopy: checked,
                    })
                  }
                  label="Habilitar auto-copia"
                  color="blue"
                />
              ) : (
                <Checkbox
                  checked={props.formatConfig.autoCopy}
                  onChange={(checked) =>
                    props.onFormatConfigChange({
                      ...props.formatConfig,
                      autoCopy: checked,
                    })
                  }
                  label="Habilitar auto-copia"
                  color="blue"
                />
              )}
            </div>
          </div>
        </Card>

        {/* Minificar */}
        <Card
          title={isJsMode ? "Minificar JavaScript" : "Minificar JSON"}
          icon="compress"
          className="bg-purple-500/10 border-purple-500/20"
          headerClassName="text-purple-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Opciones de minificación</label>
              <div className="space-y-2">
                {isJsMode ? (
                  <>
                    <Checkbox
                      checked={props.minifyConfig.removeComments}
                      onChange={(checked) =>
                        props.onMinifyConfigChange({
                          ...props.minifyConfig,
                          removeComments: checked,
                        })
                      }
                      label="Eliminar comentarios"
                      color="purple"
                    />
                    <Checkbox
                      checked={props.minifyConfig.removeSpaces}
                      onChange={(checked) =>
                        props.onMinifyConfigChange({
                          ...props.minifyConfig,
                          removeSpaces: checked,
                        })
                      }
                      label="Eliminar espacios"
                      color="purple"
                    />
                  </>
                ) : (
                  <>
                    <Checkbox
                      checked={props.minifyConfig.removeSpaces}
                      onChange={(checked) =>
                        props.onMinifyConfigChange({
                          ...props.minifyConfig,
                          removeSpaces: checked,
                        })
                      }
                      label="Eliminar todos los espacios"
                      color="purple"
                    />
                    <Checkbox
                      checked={props.minifyConfig.sortKeys}
                      onChange={(checked) =>
                        props.onMinifyConfigChange({
                          ...props.minifyConfig,
                          sortKeys: checked,
                        })
                      }
                      label="Ordenar claves alfabéticamente"
                      color="purple"
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Copiar automáticamente</label>
              {isJsMode ? (
                <Checkbox
                  checked={props.minifyConfig.autoCopy}
                  onChange={(checked) =>
                    props.onMinifyConfigChange({
                      ...props.minifyConfig,
                      autoCopy: checked,
                    })
                  }
                  label="Habilitar auto-copia"
                  color="purple"
                />
              ) : (
                <Checkbox
                  checked={props.minifyConfig.autoCopy}
                  onChange={(checked) =>
                    props.onMinifyConfigChange({
                      ...props.minifyConfig,
                      autoCopy: checked,
                    })
                  }
                  label="Habilitar auto-copia"
                  color="purple"
                />
              )}
            </div>
          </div>
        </Card>

        {/* Limpiar vacíos */}
        {!isJsMode && (
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
                    checked={props.cleanConfig.removeNull}
                    onChange={(checked) =>
                      props.onCleanConfigChange({ ...props.cleanConfig, removeNull: checked })
                    }
                    label="null"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={props.cleanConfig.removeUndefined}
                    onChange={(checked) =>
                      props.onCleanConfigChange({
                        ...props.cleanConfig,
                        removeUndefined: checked,
                      })
                    }
                    label="undefined"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={props.cleanConfig.removeEmptyString}
                    onChange={(checked) =>
                      props.onCleanConfigChange({
                        ...props.cleanConfig,
                        removeEmptyString: checked,
                      })
                    }
                    label='"" (vacío)'
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={props.cleanConfig.removeEmptyArray}
                    onChange={(checked) =>
                      props.onCleanConfigChange({
                        ...props.cleanConfig,
                        removeEmptyArray: checked,
                      })
                    }
                    label="[] (array vacío)"
                    color="orange"
                    containerClassName="p-2 bg-white/5 rounded"
                  />
                  <Checkbox
                    checked={props.cleanConfig.removeEmptyObject}
                    onChange={(checked) =>
                      props.onCleanConfigChange({
                        ...props.cleanConfig,
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
                  value={props.cleanConfig.outputFormat}
                  options={[
                    { value: "format", label: "Formatear" },
                    { value: "minify", label: "Minificar" },
                  ]}
                  onChange={(value) =>
                    props.onCleanConfigChange({ ...props.cleanConfig, outputFormat: value })
                  }
                  color="orange"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Copiar automáticamente</label>
                <Checkbox
                  checked={props.cleanConfig.autoCopy}
                  onChange={(checked) =>
                    props.onCleanConfigChange({ ...props.cleanConfig, autoCopy: checked })
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

import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Checkbox } from "./Checkbox";
import { RadioGroup } from "./RadioGroup";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import {
  DEFAULT_FORMAT_CONFIG,
  DEFAULT_MINIFY_CONFIG,
  DEFAULT_CLEAN_CONFIG,
} from "@/types/json";
import { saveToolsConfig, removeToolsConfig } from "@/services/storage";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatConfig: FormatConfig;
  onFormatConfigChange: (config: FormatConfig) => void;
  minifyConfig: MinifyConfig;
  onMinifyConfigChange: (config: MinifyConfig) => void;
  cleanConfig: CleanConfig;
  onCleanConfigChange: (config: CleanConfig) => void;
}

export function ConfigModal({
  isOpen,
  onClose,
  formatConfig,
  onFormatConfigChange,
  minifyConfig,
  onMinifyConfigChange,
  cleanConfig,
  onCleanConfigChange,
}: ConfigModalProps) {
  const handleReset = () => {
    onFormatConfigChange(DEFAULT_FORMAT_CONFIG);
    onMinifyConfigChange(DEFAULT_MINIFY_CONFIG);
    onCleanConfigChange(DEFAULT_CLEAN_CONFIG);
    removeToolsConfig();
  };

  const handleClose = () => {
    const allConfig = {
      format: formatConfig,
      minify: minifyConfig,
      clean: cleanConfig,
    };
    saveToolsConfig(allConfig);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Configuración de Herramientas"
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
          title="Formatear JSON"
          icon="indent"
          className="bg-blue-500/10 border-blue-500/20"
          headerClassName="text-blue-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Espaciado</label>
              <ToggleButtonGroup
                options={[
                  { value: 2, label: "2 espacios" },
                  { value: 4, label: "4 espacios" },
                  { value: "\t", label: "Tab" },
                ]}
                value={formatConfig.indent}
                onChange={(indent) =>
                  onFormatConfigChange({ ...formatConfig, indent })
                }
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Ordenar claves alfabéticamente
              </label>
              <Checkbox
                checked={formatConfig.sortKeys}
                onChange={(checked) =>
                  onFormatConfigChange({ ...formatConfig, sortKeys: checked })
                }
                label="Habilitar ordenamiento"
                color="blue"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente al formatear
              </label>
              <Checkbox
                checked={formatConfig.autoCopy}
                onChange={(checked) =>
                  onFormatConfigChange({ ...formatConfig, autoCopy: checked })
                }
                label="Habilitar auto-copia"
                color="blue"
              />
            </div>
          </div>
        </Card>

        {/* Minificar */}
        <Card
          title="Minificar JSON"
          icon="compress"
          className="bg-purple-500/10 border-purple-500/20"
          headerClassName="text-purple-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">
                Opciones de minificación
              </label>
              <div className="space-y-2">
                <Checkbox
                  checked={minifyConfig.removeSpaces}
                  onChange={(checked) =>
                    onMinifyConfigChange({
                      ...minifyConfig,
                      removeSpaces: checked,
                    })
                  }
                  label="Eliminar todos los espacios"
                  color="purple"
                />
                <Checkbox
                  checked={minifyConfig.sortKeys}
                  onChange={(checked) =>
                    onMinifyConfigChange({ ...minifyConfig, sortKeys: checked })
                  }
                  label="Ordenar claves alfabéticamente"
                  color="purple"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente
              </label>
              <Checkbox
                checked={minifyConfig.autoCopy}
                onChange={(checked) =>
                  onMinifyConfigChange({ ...minifyConfig, autoCopy: checked })
                }
                label="Habilitar auto-copia"
                color="purple"
              />
            </div>
          </div>
        </Card>

        {/* Limpiar vacíos */}
        <Card
          title="Limpiar Valores Vacíos"
          icon="broom"
          className="bg-orange-500/10 border-orange-500/20"
          headerClassName="text-orange-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-2">
                Valores a eliminar
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Checkbox
                  checked={cleanConfig.removeNull}
                  onChange={(checked) =>
                    onCleanConfigChange({ ...cleanConfig, removeNull: checked })
                  }
                  label="null"
                  color="orange"
                  containerClassName="p-2 bg-white/5 rounded"
                />
                <Checkbox
                  checked={cleanConfig.removeUndefined}
                  onChange={(checked) =>
                    onCleanConfigChange({
                      ...cleanConfig,
                      removeUndefined: checked,
                    })
                  }
                  label="undefined"
                  color="orange"
                  containerClassName="p-2 bg-white/5 rounded"
                />
                <Checkbox
                  checked={cleanConfig.removeEmptyString}
                  onChange={(checked) =>
                    onCleanConfigChange({
                      ...cleanConfig,
                      removeEmptyString: checked,
                    })
                  }
                  label='"" (vacío)'
                  color="orange"
                  containerClassName="p-2 bg-white/5 rounded"
                />
                <Checkbox
                  checked={cleanConfig.removeEmptyArray}
                  onChange={(checked) =>
                    onCleanConfigChange({
                      ...cleanConfig,
                      removeEmptyArray: checked,
                    })
                  }
                  label="[] (array vacío)"
                  color="orange"
                  containerClassName="p-2 bg-white/5 rounded"
                />
                <Checkbox
                  checked={cleanConfig.removeEmptyObject}
                  onChange={(checked) =>
                    onCleanConfigChange({
                      ...cleanConfig,
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
              <label className="block text-gray-300 mb-2">
                Formato de salida
              </label>
              <RadioGroup
                name="cleanOutputMode"
                value={cleanConfig.outputFormat}
                options={[
                  { value: "format", label: "Formatear" },
                  { value: "minify", label: "Minificar" },
                ]}
                onChange={(value) =>
                  onCleanConfigChange({ ...cleanConfig, outputFormat: value })
                }
                color="orange"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente
              </label>
              <Checkbox
                checked={cleanConfig.autoCopy}
                onChange={(checked) =>
                  onCleanConfigChange({ ...cleanConfig, autoCopy: checked })
                }
                label="Habilitar auto-copia"
                color="orange"
              />
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

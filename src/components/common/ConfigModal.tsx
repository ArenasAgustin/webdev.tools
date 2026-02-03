import { Modal } from "./Modal";
import { Card } from "./Card";
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
  const spacingButtonClass = (isActive: boolean) =>
    isActive
      ? "flex-1 p-2 bg-blue-500/30 border border-blue-500/50 rounded text-white transition-colors"
      : "flex-1 p-2 bg-white/10 border border-white/20 rounded text-gray-400 hover:text-white transition-colors";

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
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            <i className="fas fa-undo mr-1"></i> Restablecer
          </button>
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
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    onFormatConfigChange({
                      ...formatConfig,
                      indent: 2,
                    })
                  }
                  className={spacingButtonClass(formatConfig.indent === 2)}
                >
                  2 espacios
                </button>
                <button
                  onClick={() =>
                    onFormatConfigChange({
                      ...formatConfig,
                      indent: 4,
                    })
                  }
                  className={spacingButtonClass(formatConfig.indent === 4)}
                >
                  4 espacios
                </button>
                <button
                  onClick={() =>
                    onFormatConfigChange({
                      ...formatConfig,
                      indent: "\t",
                    })
                  }
                  className={spacingButtonClass(formatConfig.indent === "\t")}
                >
                  Tab
                </button>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Ordenar claves alfabéticamente
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                  checked={formatConfig.sortKeys}
                  onChange={(event) =>
                    onFormatConfigChange({
                      ...formatConfig,
                      sortKeys: event.target.checked,
                    })
                  }
                />
                <span className="text-gray-400">Habilitar ordenamiento</span>
              </label>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente al formatear
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                  checked={formatConfig.autoCopy}
                  onChange={(event) =>
                    onFormatConfigChange({
                      ...formatConfig,
                      autoCopy: event.target.checked,
                    })
                  }
                />
                <span className="text-gray-400">Habilitar auto-copia</span>
              </label>
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                    checked={minifyConfig.removeSpaces}
                    onChange={(event) =>
                      onMinifyConfigChange({
                        ...minifyConfig,
                        removeSpaces: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">
                    Eliminar todos los espacios
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                    checked={minifyConfig.sortKeys}
                    onChange={(event) =>
                      onMinifyConfigChange({
                        ...minifyConfig,
                        sortKeys: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">
                    Ordenar claves alfabéticamente
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-purple-500 focus:ring-purple-500"
                  checked={minifyConfig.autoCopy}
                  onChange={(event) =>
                    onMinifyConfigChange({
                      ...minifyConfig,
                      autoCopy: event.target.checked,
                    })
                  }
                />
                <span className="text-gray-400">Habilitar auto-copia</span>
              </label>
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
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={cleanConfig.removeNull}
                    onChange={(event) =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        removeNull: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">null</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={cleanConfig.removeUndefined}
                    onChange={(event) =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        removeUndefined: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">undefined</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={cleanConfig.removeEmptyString}
                    onChange={(event) =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        removeEmptyString: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">"" (vacío)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={cleanConfig.removeEmptyArray}
                    onChange={(event) =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        removeEmptyArray: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">[] (array vacío)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 rounded">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                    checked={cleanConfig.removeEmptyObject}
                    onChange={(event) =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        removeEmptyObject: event.target.checked,
                      })
                    }
                  />
                  <span className="text-gray-400">{} (objeto vacío)</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">
                Formato de salida
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cleanOutputMode"
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-gray-800 border-gray-600"
                    checked={cleanConfig.outputFormat === "format"}
                    onChange={() =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        outputFormat: "format",
                      })
                    }
                  />
                  <span className="text-gray-400">Formatear</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cleanOutputMode"
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500 bg-gray-800 border-gray-600"
                    checked={cleanConfig.outputFormat === "minify"}
                    onChange={() =>
                      onCleanConfigChange({
                        ...cleanConfig,
                        outputFormat: "minify",
                      })
                    }
                  />
                  <span className="text-gray-400">Minificar</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automáticamente
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-orange-500"
                  checked={cleanConfig.autoCopy}
                  onChange={(event) =>
                    onCleanConfigChange({
                      ...cleanConfig,
                      autoCopy: event.target.checked,
                    })
                  }
                />
                <span className="text-gray-400">Habilitar auto-copia</span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

import { Modal } from "./Modal";
import { Card } from "./Card";
import { Button } from "./Button";
import { ToggleButtonGroup } from "./ToggleButtonGroup";
import { Checkbox } from "./Checkbox";
import type { JsFormatConfig, JsMinifyConfig } from "@/types/js";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

interface JsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatConfig: JsFormatConfig;
  onFormatConfigChange: (config: JsFormatConfig) => void;
  minifyConfig: JsMinifyConfig;
  onMinifyConfigChange: (config: JsMinifyConfig) => void;
}

export function JsConfigModal({
  isOpen,
  onClose,
  formatConfig,
  onFormatConfigChange,
  minifyConfig,
  onMinifyConfigChange,
}: JsConfigModalProps) {
  const handleReset = () => {
    onFormatConfigChange(DEFAULT_JS_FORMAT_CONFIG);
    onMinifyConfigChange(DEFAULT_JS_MINIFY_CONFIG);
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Configuracion de herramientas JS"
      icon="cog"
      iconColor="yellow-400"
      maxWidth="max-w-3xl"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleReset}>
            <i className="fas fa-undo"></i> Restablecer
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-xs">
        <Card
          title="Formatear JavaScript"
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
                ]}
                value={formatConfig.indentSize}
                onChange={(indentSize) => onFormatConfigChange({ ...formatConfig, indentSize })}
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-1">
                Copiar automaticamente al formatear
              </label>
              <Checkbox
                checked={formatConfig.autoCopy}
                onChange={(checked) => onFormatConfigChange({ ...formatConfig, autoCopy: checked })}
                label="Habilitar auto-copia"
                color="blue"
              />
            </div>
          </div>
        </Card>

        <Card
          title="Minificar JavaScript"
          icon="compress"
          className="bg-purple-500/10 border-purple-500/20"
          headerClassName="text-purple-400"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 mb-1">Opciones de minificacion</label>
              <div className="space-y-2">
                <Checkbox
                  checked={minifyConfig.removeComments}
                  onChange={(checked) =>
                    onMinifyConfigChange({
                      ...minifyConfig,
                      removeComments: checked,
                    })
                  }
                  label="Eliminar comentarios"
                  color="purple"
                />
                <Checkbox
                  checked={minifyConfig.removeSpaces}
                  onChange={(checked) =>
                    onMinifyConfigChange({
                      ...minifyConfig,
                      removeSpaces: checked,
                    })
                  }
                  label="Eliminar espacios"
                  color="purple"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Copiar automaticamente</label>
              <Checkbox
                checked={minifyConfig.autoCopy}
                onChange={(checked) => onMinifyConfigChange({ ...minifyConfig, autoCopy: checked })}
                label="Habilitar auto-copia"
                color="purple"
              />
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}

import type { Meta } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ConfigModal } from "./ConfigModal";
import { DEFAULT_FORMAT_CONFIG, DEFAULT_MINIFY_CONFIG, DEFAULT_CLEAN_CONFIG } from "@/types/json";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const meta = {
  title: "Common/ConfigModal",
  component: ConfigModal,
  tags: ["autodocs"],
  args: {
    mode: "json",
    isOpen: true,
    onClose: fn(),
    formatConfig: DEFAULT_FORMAT_CONFIG,
    onFormatConfigChange: fn(),
    minifyConfig: DEFAULT_MINIFY_CONFIG,
    onMinifyConfigChange: fn(),
    cleanConfig: DEFAULT_CLEAN_CONFIG,
    onCleanConfigChange: fn(),
  },
} satisfies Meta<typeof ConfigModal>;

export default meta;

export const Default = {
  args: {
    mode: "json",
  },
};

export const Closed = {
  args: {
    mode: "json",
    isOpen: false,
  },
};

export const CustomConfig = {
  args: {
    mode: "json",
    formatConfig: {
      ...DEFAULT_FORMAT_CONFIG,
      indent: 4,
      autoCopy: true,
    },
    minifyConfig: {
      ...DEFAULT_MINIFY_CONFIG,
      autoCopy: true,
    },
  },
};

export const JsDefault = {
  args: {
    mode: "js",
    isOpen: true,
    onClose: fn(),
    formatConfig: DEFAULT_JS_FORMAT_CONFIG,
    onFormatConfigChange: fn(),
    minifyConfig: DEFAULT_JS_MINIFY_CONFIG,
    onMinifyConfigChange: fn(),
  },
};

export const JsClosed = {
  args: {
    ...JsDefault.args,
    isOpen: false,
  },
};

export const JsWithCustomConfig = {
  args: {
    ...JsDefault.args,
    formatConfig: {
      ...DEFAULT_JS_FORMAT_CONFIG,
      indentSize: 4,
      autoCopy: true,
    },
    minifyConfig: {
      ...DEFAULT_JS_MINIFY_CONFIG,
      autoCopy: true,
    },
  },
};

export const Documentation = {
  parameters: { docs: { source: { code: "" } } },
  render: () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Propiedades</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Propiedad</th>
              <th className="border p-2 text-left">Tipo</th>
              <th className="border p-2 text-left">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>isOpen</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">Si el modal está visible</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onClose</code>
              </td>
              <td className="border p-2">
                <code>() =&gt; void</code>
              </td>
              <td className="border p-2">Callback al cerrar</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>formatConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonFormatConfig</code>
              </td>
              <td className="border p-2">Configuración de formato JSON</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>minifyConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonMinifyConfig</code>
              </td>
              <td className="border p-2">Configuración de minificación</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>cleanConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonCleanConfig</code>
              </td>
              <td className="border p-2">Configuración de limpieza</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Permite configurar múltiples herramientas JSON en un modal</li>
          <li>Tabs para Format, Minify y Clean</li>
          <li>Callbacks individuales para cada configuración</li>
        </ul>
      </section>
    </div>
  ),
};

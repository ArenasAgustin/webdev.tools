import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { JsConfigModal } from "./JsConfigModal";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const meta = {
  title: "Common/JsConfigModal",
  component: JsConfigModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    onClose: fn(),
    formatConfig: DEFAULT_JS_FORMAT_CONFIG,
    onFormatConfigChange: fn(),
    minifyConfig: DEFAULT_JS_MINIFY_CONFIG,
    onMinifyConfigChange: fn(),
  },
} satisfies Meta<typeof JsConfigModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const WithCustomConfig: Story = {
  args: {
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
                <code>JsFormatConfig</code>
              </td>
              <td className="border p-2">Configuración de formato JS</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>minifyConfig</code>
              </td>
              <td className="border p-2">
                <code>JsMinifyConfig</code>
              </td>
              <td className="border p-2">Configuración de minificación JS</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Permite configurar herramientas de JavaScript</li>
          <li>Tabs para Format y Minify</li>
          <li>Soporte para indentación personalizada</li>
          <li>Auto-copy como opción</li>
        </ul>
      </section>
    </div>
  ),
};

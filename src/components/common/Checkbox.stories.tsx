import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Common/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "El componente `Checkbox` es un control de entrada reutilizable con soporte para múltiples variantes de color.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["blue", "purple", "orange", "green", "cyan"],
    },
  },
  args: {
    label: "Accept terms",
    checked: false,
    onChange: fn(),
    color: "blue",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Purple: Story = {
  args: {
    color: "purple",
    label: "Enable notifications",
  },
};

export const Orange: Story = {
  args: {
    color: "orange",
    label: "Auto-save",
    checked: true,
  },
};

export const Green: Story = {
  args: {
    color: "green",
    label: "Verified",
    checked: true,
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
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>checked</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">false</td>
              <td className="border p-2">Si está marcado</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onChange</code>
              </td>
              <td className="border p-2">
                <code>(checked: boolean) =&gt; void</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Callback cuando cambia el estado</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>label</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Etiqueta del checkbox</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>color</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">&quot;blue&quot;</td>
              <td className="border p-2">Color de la marca</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Variantes de Color</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>blue - Azul (por defecto)</li>
          <li>purple - Púrpura</li>
          <li>orange - Naranja</li>
          <li>green - Verde</li>
          <li>cyan - Cyan</li>
        </ul>
      </section>
    </div>
  ),
};

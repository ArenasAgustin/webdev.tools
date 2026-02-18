import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const meta = {
  title: "Common/ToggleButtonGroup",
  component: ToggleButtonGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "El componente `ToggleButtonGroup` es un selector genérico de opciones con múltiples variantes de comportamiento.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    value: "format",
    onChange: fn(),
    options: [
      { value: "format", label: "Format" },
      { value: "minify", label: "Minify" },
      { value: "clean", label: "Clean" },
    ],
  },
} satisfies Meta<typeof ToggleButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TwoOptions: Story = {
  args: {
    value: "on",
    options: [
      { value: "on", label: "On" },
      { value: "off", label: "Off" },
    ],
  },
};

export const Indent: Story = {
  args: {
    value: 2,
    options: [
      { value: 2, label: "2 spaces" },
      { value: 4, label: "4 spaces" },
    ],
  },
};

export const ManyOptions: Story = {
  args: {
    value: "all",
    options: [
      { value: "all", label: "All" },
      { value: "today", label: "Today" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ],
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
                <code>options</code>
              </td>
              <td className="border p-2">
                <code>Array</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Lista de opciones disponibles</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>value</code>
              </td>
              <td className="border p-2">
                <code>string | string[]</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Valor/valores seleccionados</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onChange</code>
              </td>
              <td className="border p-2">
                <code>() =&gt; void</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Callback cuando cambia la selección</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>variant</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">&quot;single&quot;</td>
              <td className="border p-2">Modo de selección (single o multiple)</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Modos</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>single</strong> - Solo una opción puede estar seleccionada
          </li>
          <li>
            <strong>multiple</strong> - Varias opciones pueden estar seleccionadas simultanéamente
          </li>
        </ul>
      </section>
    </div>
  ),
};

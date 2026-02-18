import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Common/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "El componente `RadioGroup` es un selector de opción única reutilizable con múltiples variantes visuales.",
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
    name: "options",
    value: "option1",
    onChange: fn(),
    color: "blue",
    options: [
      { value: "option1", label: "First" },
      { value: "option2", label: "Second" },
      { value: "option3", label: "Third" },
    ],
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Purple: Story = {
  args: {
    color: "purple",
    value: "option2",
  },
};

export const Orange: Story = {
  args: {
    color: "orange",
    options: [
      { value: "format", label: "Formatear" },
      { value: "minify", label: "Minificar" },
    ],
    value: "format",
  },
};

export const SingleOption: Story = {
  args: {
    options: [{ value: "only", label: "Only Choice" }],
    value: "only",
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
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Valor seleccionado actualmente</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onChange</code>
              </td>
              <td className="border p-2">
                <code>(value: string) =&gt; void</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Callback cuando cambia la selección</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>name</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Nombre del grupo de radio (HTML)</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Comportamiento</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Solo una opción puede estar seleccionada a la vez</li>
          <li>Soporte completo de navegación por teclado (Arrow keys)</li>
          <li>ENTER para seleccionar opción enfocada</li>
        </ul>
      </section>
    </div>
  ),
};

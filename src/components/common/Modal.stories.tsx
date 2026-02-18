import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Modal } from "./Modal";

const meta = {
  title: "Common/Modal",
  component: Modal,
  parameters: {
    docs: {
      description: {
        component:
          "El componente `Modal` es un diálogo reutilizable que muestra contenido en un overlay, con manejo automático de focus trap y tecla ESC.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    iconColor: {
      control: "select",
      options: [
        "blue-400",
        "purple-400",
        "orange-400",
        "green-400",
        "cyan-400",
        "red-400",
        "yellow-400",
      ],
    },
  },
  args: {
    isOpen: true,
    title: "Sample Modal",
    icon: "info-circle",
    iconColor: "blue-400",
    onClose: fn(),
    children: (
      <div className="space-y-2">
        <p className="text-gray-300">This is modal content.</p>
        <p className="text-gray-300">You can include any React elements here.</p>
      </div>
    ),
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
  args: {
    title: "Confirmation",
    icon: "question-circle",
    iconColor: "yellow-400",
    footer: (
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
          Cancel
        </button>
        <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
          Confirm
        </button>
      </div>
    ),
  },
};

export const Purple: Story = {
  args: {
    title: "Settings",
    icon: "cog",
    iconColor: "purple-400",
    children: <p className="text-gray-300">Configure your preferences in this modal.</p>,
  },
};

export const Error: Story = {
  args: {
    title: "Error",
    icon: "exclamation-circle",
    iconColor: "red-400",
    children: (
      <div className="space-y-2">
        <p className="text-gray-300">An error occurred while processing your request.</p>
        <p className="text-gray-300">Please try again later.</p>
      </div>
    ),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
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
                <code>isOpen</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Si el modal está visible</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>title</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Título del modal</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>icon</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Icono de Font Awesome (sin prefijo &quot;fa-&quot;)</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onClose</code>
              </td>
              <td className="border p-2">
                <code>() =&gt; void</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Callback al cerrar el modal</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Focus Trap</strong> - El foco se mantiene dentro del modal
          </li>
          <li>
            <strong>ESC para cerrar</strong> - Presionar ESC cierra el modal automáticamente
          </li>
          <li>
            <strong>Prevención de scroll</strong> - El body no scrollea mientras el modal es visible
          </li>
          <li>
            <strong>Overlay oscuro</strong> - Fondo semi-transparente que bloquea interacción
          </li>
        </ul>
      </section>
    </div>
  ),
};

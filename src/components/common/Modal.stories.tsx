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

// Advanced Stories
export const VeryLongTitle: Story = {
  args: {
    title:
      "This is an extremely long modal title that might cause layout issues and should be handled gracefully",
    icon: "exclamation-triangle",
    iconColor: "orange-400",
    children: <p className="text-gray-300">Content with a very long title</p>,
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: título muy largo que podría romper el layout del header",
      },
    },
  },
};

export const ScrollableContent: Story = {
  args: {
    title: "Long Content",
    icon: "scroll",
    iconColor: "cyan-400",
    children: (
      <div className="space-y-3">
        {Array.from({ length: 30 }, (_, i) => (
          <p key={i} className="text-gray-300">
            This is paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: contenido muy largo que requiere scroll interno",
      },
    },
  },
};

export const WithComplexFooter: Story = {
  args: {
    title: "Action Center",
    icon: "tasks",
    iconColor: "purple-400",
    children: <p className="text-gray-300">Select an action to continue</p>,
    footer: (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">3 unsaved changes</span>
          <div className="flex gap-2">
            <button className="px-2 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
              Discard
            </button>
            <button className="px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700">
              Save Draft
            </button>
            <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
              Publish
            </button>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: footer complejo con múltiples botones y estado",
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    title: "Confirm",
    icon: "check",
    iconColor: "green-400",
    children: <p className="text-gray-300">Are you sure?</p>,
  },
  parameters: {
    docs: {
      description: {
        story: "Caso simple: contenido mínimo con pregunta corta",
      },
    },
  },
};

export const WithFormContent: Story = {
  args: {
    title: "User Settings",
    icon: "user-cog",
    iconColor: "blue-400",
    children: (
      <form className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Role</label>
          <select className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300">
            <option>Admin</option>
            <option>User</option>
            <option>Guest</option>
          </select>
        </div>
      </form>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <button className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600">
          Cancel
        </button>
        <button className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">
          Save
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Patrón común: modal con formulario y footer de acciones",
      },
    },
  },
};

export const LoadingState: Story = {
  args: {
    title: "Processing",
    icon: "spinner",
    iconColor: "blue-400",
    children: (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="animate-spin text-4xl">⏳</div>
        <p className="text-gray-300">Please wait while we process your request...</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Estado de carga: modal mostrando progreso/loading",
      },
    },
  },
};

export const SuccessState: Story = {
  args: {
    title: "Success!",
    icon: "check-circle",
    iconColor: "green-400",
    children: (
      <div className="text-center py-4">
        <div className="text-6xl mb-3">✓</div>
        <p className="text-gray-300 text-lg">Your changes have been saved successfully.</p>
      </div>
    ),
    footer: (
      <div className="flex justify-center">
        <button className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700">
          Continue
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Estado de éxito: feedback visual positivo",
      },
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

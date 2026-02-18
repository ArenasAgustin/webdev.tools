import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./Button";

const meta = {
  title: "Common/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "El componente `Button` es un botón reutilizable con múltiples variantes visuales que se adaptan a diferentes contextos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "danger", "success", "purple", "cyan", "orange"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
  args: {
    children: "Action",
    onClick: fn(),
    variant: "primary",
    size: "sm",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Delete",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Saved",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Run",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

// Advanced Stories
export const WithIcon: Story = {
  args: {
    variant: "primary",
    children: (
      <>
        <span>⬇</span> Download
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: (
      <>
        <span className="inline-block animate-spin">⏳</span> Loading...
      </>
    ),
  },
};

export const LongText: Story = {
  args: {
    children: "This is a very long button text that might cause layout issues",
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: texto muy largo que podría afectar el layout",
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
      <Button variant="purple">Purple</Button>
      <Button variant="cyan">Cyan</Button>
      <Button variant="orange">Orange</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Todas las variantes de color disponibles",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Todos los tamaños disponibles",
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
                <code>children</code>
              </td>
              <td className="border p-2">
                <code>ReactNode</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Contenido del botón</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>variant</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">&quot;primary&quot;</td>
              <td className="border p-2">Estilo visual: primary, danger, success, etc</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>size</code>
              </td>
              <td className="border p-2">
                <code>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</code>
              </td>
              <td className="border p-2">&quot;md&quot;</td>
              <td className="border p-2">Tamaño del botón</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>disabled</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">false</td>
              <td className="border p-2">Si está deshabilitado</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Variantes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>primary</strong> - Azul, para acciones principales
          </li>
          <li>
            <strong>danger</strong> - Rojo, para acciones destructivas
          </li>
          <li>
            <strong>success</strong> - Verde, para acciones exitosas
          </li>
          <li>
            <strong>purple</strong> - Púrpura, para contextos especiales
          </li>
          <li>
            <strong>cyan</strong> - Cyan, para acciones informativas
          </li>
          <li>
            <strong>orange</strong> - Naranja, para advertencias
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Accesibilidad</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Usa <code>&lt;button&gt;</code> nativo para soporte de teclado automático
          </li>
          <li>
            Los iconos tienen <code>aria-hidden=&quot;true&quot;</code> para no interferir con
            lectores de pantalla
          </li>
          <li>Proporciona etiquetas de texto descriptivas</li>
        </ul>
      </section>
    </div>
  ),
};

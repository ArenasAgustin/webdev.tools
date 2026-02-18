import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Common/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "El componente `Card` es un contenedor reutilizable para agrupar contenido relacionado con estilos consistentes.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    title: "Card Title",
    icon: "info-circle",
    children: "This is a card content area",
    className: "bg-blue-500/10 border-blue-500/20",
    headerClassName: "text-blue-400",
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcon: Story = {
  args: {
    title: "Settings",
    icon: "cog",
    className: "bg-purple-500/10 border-purple-500/20",
    headerClassName: "text-purple-400",
    children: "Configure your preferences here",
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    className: "bg-gray-500/10 border-gray-500/20",
    children: "Content without a title",
  },
};

export const LargeContent: Story = {
  args: {
    title: "Documentation",
    icon: "book",
    className: "bg-cyan-500/10 border-cyan-500/20",
    headerClassName: "text-cyan-400",
    children: (
      <div className="space-y-2">
        <p>Storybook is a powerful tool for component development.</p>
        <p>It helps you build and test components in isolation.</p>
        <p>This card demonstrates multiple lines of content.</p>
      </div>
    ),
  },
};

// Advanced Stories
export const VeryLongTitle: Story = {
  args: {
    title:
      "This is an extremely long title that might cause layout issues and text overflow problems",
    icon: "exclamation-triangle",
    className: "bg-orange-500/10 border-orange-500/20",
    headerClassName: "text-orange-400",
    children: "Content with a very long title",
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: título muy largo que podría romper el layout",
      },
    },
  },
};

export const MinimalContent: Story = {
  args: {
    title: "Empty",
    icon: "inbox",
    className: "bg-gray-500/10 border-gray-500/20",
    headerClassName: "text-gray-400",
    children: "",
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: contenido vacío",
      },
    },
  },
};

export const ComplexContent: Story = {
  args: {
    title: "Complex Layout",
    icon: "layer-group",
    className: "bg-purple-500/10 border-purple-500/20",
    headerClassName: "text-purple-400",
    children: (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-blue-500/20 rounded text-xs">Button 1</button>
          <button className="px-2 py-1 bg-green-500/20 rounded text-xs">Button 2</button>
        </div>
        <div className="border border-gray-700 p-2 rounded">
          <p className="text-sm">Nested content area</p>
        </div>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: contenido complejo con múltiples elementos anidados",
      },
    },
  },
};

export const VeryLongScrollableContent: Story = {
  args: {
    title: "Scrollable Content",
    icon: "scroll",
    className: "bg-cyan-500/10 border-cyan-500/20",
    headerClassName: "text-cyan-400",
    children: (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-sm">
            This is line {i + 1} of scrollable content. Lorem ipsum dolor sit amet.
          </p>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: contenido muy largo que requiere scroll",
      },
    },
  },
};

export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Card
        title="Card 1"
        icon="star"
        className="bg-yellow-500/10 border-yellow-500/20"
        headerClassName="text-yellow-400"
      >
        Content 1
      </Card>
      <Card
        title="Card 2"
        icon="heart"
        className="bg-red-500/10 border-red-500/20"
        headerClassName="text-red-400"
      >
        Content 2
      </Card>
      <Card
        title="Card 3"
        icon="check"
        className="bg-green-500/10 border-green-500/20"
        headerClassName="text-green-400"
      >
        Content 3
      </Card>
      <Card
        title="Card 4"
        icon="bolt"
        className="bg-blue-500/10 border-blue-500/20"
        headerClassName="text-blue-400"
      >
        Content 4
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Patrón común: múltiples cards en grid layout",
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
                <code>title</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Título opcional de la tarjeta</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>icon</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Icono de Font Awesome</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>children</code>
              </td>
              <td className="border p-2">
                <code>ReactNode</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Contenido de la tarjeta</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">-</td>
              <td className="border p-2">Clases Tailwind personalizadas</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Styling</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Usa glassmorphism con <code>backdrop-blur</code>
          </li>
          <li>Bordes semi-transparentes</li>
          <li>Colores adaptables mediante clases Tailwind</li>
        </ul>
      </section>
    </div>
  ),
};

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

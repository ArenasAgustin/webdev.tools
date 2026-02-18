import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TipsModal } from "./TipsModal";
import type { TipItem, QuickExample } from "./TipsModal";

const mockTips: TipItem[] = [
  {
    id: "selector",
    category: "Selectores",
    categoryIcon: "target",
    categoryColor: "blue-400",
    items: [
      {
        code: "$.store.book[*].author",
        description: "Obtiene todos los autores de los libros",
      },
      {
        code: "$..author",
        description: "Encuentra todos los autores en cualquier nivel",
      },
    ],
  },
  {
    id: "filter",
    category: "Filtros",
    categoryIcon: "filter",
    categoryColor: "purple-400",
    items: [
      {
        code: "$..book[?(@.price < 10)]",
        description: "Libros con precio menor a 10",
      },
      {
        code: "$..book[?(@.category == 'fiction')]",
        description: "Libros de ficción",
      },
    ],
  },
];

const mockQuickExamples: QuickExample[] = [
  {
    code: '{"name": "John", "age": 30}',
    label: "Persona",
    description: "JSON básico de una persona",
  },
  {
    code: '{"store": {"book": [{"title": "Book 1", "price": 5}]}}',
    label: "Tienda",
    description: "JSON de tienda con libros",
  },
];

const meta = {
  title: "Common/TipsModal",
  component: TipsModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    title: "Filtros JSONPath",
    icon: "info-circle",
    iconColor: "cyan-400",
    tips: mockTips,
    onClose: fn(),
    onTryExample: fn(),
  },
} satisfies Meta<typeof TipsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const Empty: Story = {
  args: {
    isOpen: true,
    tips: [],
  },
};

export const WithQuickExamples: Story = {
  args: {
    isOpen: true,
    quickExamples: mockQuickExamples,
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
                <code>title</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">Título del modal</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tips</code>
              </td>
              <td className="border p-2">
                <code>TipItem[]</code>
              </td>
              <td className="border p-2">Lista de tips organizados por categorías</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>quickExamples</code>
              </td>
              <td className="border p-2">
                <code>QuickExample[]</code>
              </td>
              <td className="border p-2">Ejemplos rápidos de JSON</td>
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
                <code>onTryExample</code>
              </td>
              <td className="border p-2">
                <code>(code: string) =&gt; void</code>
              </td>
              <td className="border p-2">Usar un ejemplo en el playground</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Muestra tips y trucos organizados por categorías</li>
          <li>Cada tip tiene icono y color de categoría</li>
          <li>Quick examples para probar rápidamente</li>
          <li>Botón &quot;Try Example&quot; para usar ejemplos directamente</li>
        </ul>
      </section>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { JsonPathHistoryModal } from "./JsonPathHistoryModal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";

const mockHistory: JsonPathHistoryItem[] = [
  {
    id: "1",
    expression: "$.store.book[*].author",
    timestamp: Date.now() - 60000,
    frequency: 5,
  },
  {
    id: "2",
    expression: "$..[?(@.price < 10)]",
    timestamp: Date.now() - 120000,
    frequency: 3,
  },
  {
    id: "3",
    expression: "$.store.book[?(@.category == 'fiction')]",
    timestamp: Date.now() - 300000,
    frequency: 2,
  },
];

const meta = {
  title: "Common/JsonPathHistoryModal",
  component: JsonPathHistoryModal,
  tags: ["autodocs"],
  args: {
    isOpen: true,
    history: mockHistory,
    onClose: fn(),
    onReuse: fn(),
    onDelete: fn(),
    onClearAll: fn(),
  },
} satisfies Meta<typeof JsonPathHistoryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    history: [],
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const ManyItems: Story = {
  args: {
    history: [
      ...mockHistory,
      {
        id: "4",
        expression: "$.store[*]",
        timestamp: Date.now() - 600000,
        frequency: 1,
      },
      {
        id: "5",
        expression: "$..name",
        timestamp: Date.now() - 900000,
        frequency: 8,
      },
    ],
  },
};

// Advanced Stories
export const VeryLongExpressions: Story = {
  args: {
    history: [
      {
        id: "1",
        expression:
          "$.store.book[?(@.price < 10 && @.category == 'fiction' && @.author.name.length > 20)].title",
        timestamp: Date.now() - 60000,
        frequency: 3,
      },
      {
        id: "2",
        expression: "$..book[?(@.isbn)][?(@.price > 8.95 && @.price < 22.99)].[author,title,price]",
        timestamp: Date.now() - 120000,
        frequency: 1,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: expresiones JSONPath muy largas que podrían afectar el layout",
      },
    },
  },
};

export const HighFrequency: Story = {
  args: {
    history: [
      {
        id: "1",
        expression: "$.store.book[*]",
        timestamp: Date.now() - 60000,
        frequency: 99,
      },
      {
        id: "2",
        expression: "$..*",
        timestamp: Date.now() - 120000,
        frequency: 150,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: frecuencias muy altas (números de 2-3 dígitos)",
      },
    },
  },
};

export const OldTimestamps: Story = {
  args: {
    history: [
      {
        id: "1",
        expression: "$.store.book[*]",
        timestamp: Date.now() - 86400000 * 30, // 30 días
        frequency: 5,
      },
      {
        id: "2",
        expression: "$..price",
        timestamp: Date.now() - 86400000 * 365, // 1 año
        frequency: 2,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: timestamps muy antiguos (meses/años atrás)",
      },
    },
  },
};

export const SingleItem: Story = {
  args: {
    history: [mockHistory[0]],
  },
  parameters: {
    docs: {
      description: {
        story: "Caso simple: solo un item en el historial",
      },
    },
  },
};

export const ScrollableList: Story = {
  args: {
    history: Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      expression: `$.store.book[${i}].title`,
      timestamp: Date.now() - i * 60000,
      frequency: Math.floor(Math.random() * 10) + 1,
    })),
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: muchos items que requieren scroll",
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
                <code>history</code>
              </td>
              <td className="border p-2">
                <code>JsonPathHistoryItem[]</code>
              </td>
              <td className="border p-2">Lista de expresiones anteriores</td>
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
                <code>onReuse</code>
              </td>
              <td className="border p-2">
                <code>(expr: string) =&gt; void</code>
              </td>
              <td className="border p-2">Reutilizar una expresión</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onDelete</code>
              </td>
              <td className="border p-2">
                <code>(id: string) =&gt; void</code>
              </td>
              <td className="border p-2">Eliminar un item del historial</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onClearAll</code>
              </td>
              <td className="border p-2">
                <code>() =&gt; void</code>
              </td>
              <td className="border p-2">Limpiar todo el historial</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Muestra historial de expresiones JSONPath</li>
          <li>Cada item incluye timestamp y frecuencia de uso</li>
          <li>Permite reutilizar, eliminar o limpiar historial</li>
          <li>Útil para acceder a filtros comúnmente usados</li>
        </ul>
      </section>
    </div>
  ),
};

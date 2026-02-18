import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Toolbar } from "./Toolbar";
import type { JsonToolbarProps, GenericToolbarProps } from "./Toolbar";
import { DEFAULT_FORMAT_CONFIG, DEFAULT_MINIFY_CONFIG, DEFAULT_CLEAN_CONFIG } from "@/types/json";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";

const mockHistory: JsonPathHistoryItem[] = [
  {
    id: "1",
    expression: "$.store.book[*].author",
    timestamp: Date.now() - 60000,
    frequency: 5,
  },
];

const mockTips = [
  {
    id: "selector",
    category: "Selectores",
    categoryIcon: "target",
    categoryColor: "blue-400" as const,
    items: [
      {
        code: "$.store.book[*].author",
        description: "Obtiene todos los autores",
      },
    ],
  },
];

const meta = {
  title: "Layout/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JsonVariant: Story = {
  args: {
    variant: "json",
    actions: {
      onFormat: fn(),
      onMinify: fn(),
      onClean: fn(),
      onFilter: fn(),
    },
    jsonPath: {
      value: "$.store.book[*]",
      onChange: fn(),
    },
    history: {
      items: mockHistory,
      onReuse: fn(),
      onDelete: fn(),
      onClear: fn(),
    },
    config: {
      format: DEFAULT_FORMAT_CONFIG,
      onFormatChange: fn(),
      minify: DEFAULT_MINIFY_CONFIG,
      onMinifyChange: fn(),
      clean: DEFAULT_CLEAN_CONFIG,
      onCleanChange: fn(),
    },
    tips: {
      config: { tips: mockTips },
      onShow: fn(),
    },
  } as JsonToolbarProps,
};

export const JsonWithoutTips: Story = {
  args: {
    variant: "json",
    actions: {
      onFormat: fn(),
      onMinify: fn(),
      onClean: fn(),
      onFilter: fn(),
    },
    jsonPath: {
      value: "",
      onChange: fn(),
    },
    config: {
      format: DEFAULT_FORMAT_CONFIG,
      onFormatChange: fn(),
      minify: DEFAULT_MINIFY_CONFIG,
      onMinifyChange: fn(),
      clean: DEFAULT_CLEAN_CONFIG,
      onCleanChange: fn(),
    },
  } as JsonToolbarProps,
};

export const GenericVariant: Story = {
  args: {
    variant: "generic",
    tools: {
      title: "Herramientas de JavaScript",
      actions: [
        { label: "Formatear", icon: "indent", variant: "primary" as const, onClick: fn() },
        { label: "Minificar", icon: "compress", variant: "success" as const, onClick: fn() },
        { label: "Descargar", icon: "download", variant: "cyan" as const, onClick: fn() },
      ],
      onOpenConfig: fn(),
      configButtonTitle: "Configurar JS",
      gridClassName: "grid grid-cols-3 gap-2",
    },
  } as GenericToolbarProps,
};

export const GenericMinimal: Story = {
  args: {
    variant: "generic",
    tools: {
      actions: [
        { label: "Acción 1", icon: "star", variant: "primary" as const, onClick: fn() },
        { label: "Acción 2", icon: "heart", variant: "danger" as const, onClick: fn() },
      ],
    },
  } as GenericToolbarProps,
};

export const Documentation = {
  parameters: { docs: { source: { code: "" } } },
  render: () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Variantes</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>json</strong> - Barra de herramientas para JSON (Format, Minify, Clean, Filter)
          </li>
          <li>
            <strong>js</strong> - Barra de herramientas para JavaScript (Format, Minify, Download)
          </li>
          <li>
            <strong>generic</strong> - Barra de herramientas genérica personalizable
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Propiedades - JSON/JS</h2>
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
                <code>variant</code>
              </td>
              <td className="border p-2">
                <code>&quot;json&quot; | &quot;js&quot;</code>
              </td>
              <td className="border p-2">Tipo de barra de herramientas</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>actions</code>
              </td>
              <td className="border p-2">
                <code>object</code>
              </td>
              <td className="border p-2">Callbacks de acciones (onFormat, onMinify, etc)</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>jsonPath</code>
              </td>
              <td className="border p-2">
                <code>object</code>
              </td>
              <td className="border p-2">Configuración del filtro JSONPath</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>config</code>
              </td>
              <td className="border p-2">
                <code>object</code>
              </td>
              <td className="border p-2">Estados de configuración abierto/cerrado</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Propiedades - Generic</h2>
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
                <code>variant</code>
              </td>
              <td className="border p-2">
                <code>&quot;generic&quot;</code>
              </td>
              <td className="border p-2">Tipo genérico</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tools</code>
              </td>
              <td className="border p-2">
                <code>GenericToolbarProps[&quot;tools&quot;]</code>
              </td>
              <td className="border p-2">Configuración de herramientas personalizadas</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tools.actions</code>
              </td>
              <td className="border p-2">
                <code>array</code>
              </td>
              <td className="border p-2">Array de acciones (label, icon, onClick)</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tools.title</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">Título de la barra</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  ),
};

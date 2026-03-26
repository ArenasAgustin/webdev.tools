import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Toolbar } from "./Toolbar";
import type { ToolbarProps } from "./Toolbar";
import {
  DEFAULT_JSON_FORMAT_CONFIG,
  DEFAULT_JSON_MINIFY_CONFIG,
  DEFAULT_JSON_CLEAN_CONFIG,
} from "@/types/json";
import { Button } from "@/components/common/Button";

const meta = {
  title: "Layout/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JsonWithExtraContent: Story = {
  args: {
    variant: "generic",
    tools: {
      actions: [
        { label: "Formatear", icon: "indent", variant: "primary" as const, onClick: fn() },
        { label: "Minificar", icon: "compress", variant: "purple" as const, onClick: fn() },
        { label: "Limpiar vacíos", icon: "broom", variant: "orange" as const, onClick: fn() },
      ],
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
    },
    config: {
      mode: "json",
      format: DEFAULT_JSON_FORMAT_CONFIG,
      onFormatChange: fn(),
      minify: DEFAULT_JSON_MINIFY_CONFIG,
      onMinifyChange: fn(),
      clean: DEFAULT_JSON_CLEAN_CONFIG,
      onCleanChange: fn(),
    },
    extraContent: (
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <i className="fas fa-filter text-cyan-400"></i> Filtro JSONPath
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            defaultValue="$.store.book[*]"
            className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
            placeholder="Ej: $.users[0].name"
          />
          <Button variant="cyan" size="md" onClick={fn()}>
            <i className="fas fa-search"></i>
          </Button>
        </div>
      </div>
    ),
  } as ToolbarProps,
};

export const JsonMinimal: Story = {
  args: {
    variant: "generic",
    tools: {
      actions: [
        { label: "Formatear", icon: "indent", variant: "primary" as const, onClick: fn() },
        { label: "Minificar", icon: "compress", variant: "purple" as const, onClick: fn() },
        { label: "Limpiar vacíos", icon: "broom", variant: "orange" as const, onClick: fn() },
      ],
      configButtonTitle: "Configurar herramientas",
      gridClassName: "grid grid-cols-2 sm:grid-cols-3 gap-2",
    },
    config: {
      mode: "json",
      format: DEFAULT_JSON_FORMAT_CONFIG,
      onFormatChange: fn(),
      minify: DEFAULT_JSON_MINIFY_CONFIG,
      onMinifyChange: fn(),
      clean: DEFAULT_JSON_CLEAN_CONFIG,
      onCleanChange: fn(),
    },
  } as ToolbarProps,
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
  } as ToolbarProps,
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
  } as ToolbarProps,
};

export const GenericManyActions: Story = {
  args: {
    variant: "generic",
    tools: {
      title: "Herramientas Múltiples",
      actions: [
        { label: "Formatear", icon: "indent", variant: "primary" as const, onClick: fn() },
        { label: "Minificar", icon: "compress", variant: "success" as const, onClick: fn() },
        { label: "Validar", icon: "check", variant: "cyan" as const, onClick: fn() },
        { label: "Descargar", icon: "download", variant: "purple" as const, onClick: fn() },
        { label: "Copiar", icon: "copy", variant: "orange" as const, onClick: fn() },
        { label: "Limpiar", icon: "trash", variant: "danger" as const, onClick: fn() },
      ],
      onOpenConfig: fn(),
      gridClassName: "grid grid-cols-3 gap-2",
    },
  } as ToolbarProps,
  parameters: {
    docs: {
      description: {
        story: "Edge case: muchas acciones (6+ botones) que requieren grid layout",
      },
    },
  },
};

export const GenericWithLongLabels: Story = {
  args: {
    variant: "generic",
    tools: {
      title: "Herramientas con Etiquetas Muy Largas",
      actions: [
        {
          label: "Formatear y Embellecer",
          icon: "indent",
          variant: "primary" as const,
          onClick: fn(),
        },
        {
          label: "Minificar y Comprimir",
          icon: "compress",
          variant: "success" as const,
          onClick: fn(),
        },
      ],
      onOpenConfig: fn(),
    },
  } as ToolbarProps,
  parameters: {
    docs: {
      description: {
        story: "Edge case: labels largos que podrían romper el layout de los botones",
      },
    },
  },
};

export const Documentation = {
  parameters: { docs: { source: { code: "" } } },
  render: () => (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Variante</h2>
        <p>
          El Toolbar usa una sola variante <strong>generic</strong> para todos los playgrounds.
          Contenido adicional (como JSONPath) se pasa via <code>extraContent</code>.
        </p>
      </section>
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
                <code>variant</code>
              </td>
              <td className="border p-2">
                <code>&quot;generic&quot;</code>
              </td>
              <td className="border p-2">Tipo de barra de herramientas</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tools</code>
              </td>
              <td className="border p-2">
                <code>ToolbarConfig</code>
              </td>
              <td className="border p-2">Configuración de herramientas personalizadas</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>extraContent</code>
              </td>
              <td className="border p-2">
                <code>React.ReactNode</code>
              </td>
              <td className="border p-2">Contenido adicional (ej: sección JSONPath)</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>config</code>
              </td>
              <td className="border p-2">
                <code>object</code>
              </td>
              <td className="border p-2">Configuración del modal (json, js, html, css)</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  ),
};

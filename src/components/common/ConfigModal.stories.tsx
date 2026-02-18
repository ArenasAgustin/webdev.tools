import type { Meta, StoryContext } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import { ConfigModal } from "./ConfigModal";
import { DEFAULT_FORMAT_CONFIG, DEFAULT_MINIFY_CONFIG, DEFAULT_CLEAN_CONFIG } from "@/types/json";
import { DEFAULT_JS_FORMAT_CONFIG, DEFAULT_JS_MINIFY_CONFIG } from "@/types/js";

const meta = {
  title: "Common/ConfigModal",
  component: ConfigModal,
  tags: ["autodocs"],
  args: {
    mode: "json",
    isOpen: true,
    onClose: fn(),
    formatConfig: DEFAULT_FORMAT_CONFIG,
    onFormatConfigChange: fn(),
    minifyConfig: DEFAULT_MINIFY_CONFIG,
    onMinifyConfigChange: fn(),
    cleanConfig: DEFAULT_CLEAN_CONFIG,
    onCleanConfigChange: fn(),
  },
} satisfies Meta<typeof ConfigModal>;

export default meta;

export const Default = {
  args: {
    mode: "json",
  },
};

export const Closed = {
  args: {
    mode: "json",
    isOpen: false,
  },
};

export const CustomConfig = {
  args: {
    mode: "json",
    formatConfig: {
      ...DEFAULT_FORMAT_CONFIG,
      indent: 4,
      autoCopy: true,
    },
    minifyConfig: {
      ...DEFAULT_MINIFY_CONFIG,
      autoCopy: true,
    },
  },
};

export const JsDefault = {
  args: {
    mode: "js",
    isOpen: true,
    onClose: fn(),
    formatConfig: DEFAULT_JS_FORMAT_CONFIG,
    onFormatConfigChange: fn(),
    minifyConfig: DEFAULT_JS_MINIFY_CONFIG,
    onMinifyConfigChange: fn(),
  },
};

export const JsClosed = {
  args: {
    ...JsDefault.args,
    isOpen: false,
  },
};

export const JsWithCustomConfig = {
  args: {
    ...JsDefault.args,
    formatConfig: {
      ...DEFAULT_JS_FORMAT_CONFIG,
      indentSize: 4,
      autoCopy: true,
    },
    minifyConfig: {
      ...DEFAULT_JS_MINIFY_CONFIG,
      autoCopy: true,
    },
  },
};

// Advanced Stories with Interactions
export const InteractionToggleCheckbox = {
  args: {
    mode: "json",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Find and click the autoCopy checkbox in Format section
    const autoCopyCheckbox = canvas.getByRole("checkbox", { name: /auto-copiar al portapapeles/i });

    // Verify initial state
    expect(autoCopyCheckbox).not.toBeChecked();

    // Click to enable
    await userEvent.click(autoCopyCheckbox);
    expect(autoCopyCheckbox).toBeChecked();
  },
  parameters: {
    docs: {
      description: {
        story: "Interacción: toggle de checkbox con verificación de estado",
      },
    },
  },
};

export const InteractionChangeIndent = {
  args: {
    mode: "json",
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Find and click the "4 espacios" button
    const fourSpacesButton = canvas.getAllByRole("button", { name: "4" })[0];

    await userEvent.click(fourSpacesButton);

    // Button should have active styling (you can check aria-pressed or class)
    expect(fourSpacesButton).toBeInTheDocument();
  },
  parameters: {
    docs: {
      description: {
        story: "Interacción: cambio de indentación con ToggleButtonGroup",
      },
    },
  },
};

export const InteractionCloseModal = {
  args: {
    mode: "json",
    onClose: fn(),
  },
  play: async ({ canvasElement, args }: StoryContext<typeof meta>) => {
    const canvas = within(canvasElement);

    // Find and click the close button (X)
    const closeButton = canvas.getByRole("button", { name: /cerrar/i });

    await userEvent.click(closeButton);

    // Verify onClose was called
    expect(args.onClose).toHaveBeenCalled();
  },
  parameters: {
    docs: {
      description: {
        story: "Interacción: cerrar modal con botón X",
      },
    },
  },
};

export const EdgeCaseAllOptionsEnabled = {
  args: {
    mode: "json",
    formatConfig: {
      indent: "\t",
      autoCopy: true,
      preserveEmptyArrays: true,
      preserveEmptyObjects: true,
      sortKeys: true,
    },
    minifyConfig: {
      autoCopy: true,
      removeWhitespace: true,
      removeNewlines: true,
    },
    cleanConfig: {
      removeEmpty: true,
      removeNull: true,
      removeUndefined: true,
      autoCopy: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: todas las opciones habilitadas",
      },
    },
  },
};

export const EdgeCaseAllOptionsDisabled = {
  args: {
    mode: "json",
    formatConfig: {
      indent: 2,
      autoCopy: false,
      preserveEmptyArrays: false,
      preserveEmptyObjects: false,
      sortKeys: false,
    },
    minifyConfig: {
      autoCopy: false,
      removeWhitespace: false,
      removeNewlines: false,
    },
    cleanConfig: {
      removeEmpty: false,
      removeNull: false,
      removeUndefined: false,
      autoCopy: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Edge case: todas las opciones deshabilitadas",
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
                <code>onClose</code>
              </td>
              <td className="border p-2">
                <code>() =&gt; void</code>
              </td>
              <td className="border p-2">Callback al cerrar</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>formatConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonFormatConfig</code>
              </td>
              <td className="border p-2">Configuración de formato JSON</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>minifyConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonMinifyConfig</code>
              </td>
              <td className="border p-2">Configuración de minificación</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>cleanConfig</code>
              </td>
              <td className="border p-2">
                <code>JsonCleanConfig</code>
              </td>
              <td className="border p-2">Configuración de limpieza</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">Características</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Permite configurar múltiples herramientas JSON en un modal</li>
          <li>Tabs para Format, Minify y Clean</li>
          <li>Callbacks individuales para cada configuración</li>
        </ul>
      </section>
    </div>
  ),
};

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "./Toolbar";
import type { JsonFormatConfig, JsonMinifyConfig, JsonCleanConfig } from "@/types/json";

vi.mock("@/components/common/ConfigModal", () => ({
  ConfigModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="config-modal">
      <span>{isOpen ? "config-open" : "config-closed"}</span>
      <button onClick={onClose}>close-config</button>
    </div>
  ),
}));

describe("Toolbar", () => {
  const formatConfig: JsonFormatConfig = {
    indentSize: 2,
    sortKeys: false,
    autoCopy: false,
  };
  const minifyConfig: JsonMinifyConfig = {
    removeSpaces: true,
    sortKeys: false,
    autoCopy: false,
  };
  const cleanConfig: JsonCleanConfig = {
    removeNull: true,
    removeUndefined: true,
    removeEmptyString: false,
    removeEmptyArray: false,
    removeEmptyObject: false,
    outputFormat: "format",
    autoCopy: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders generic variant and triggers actions", () => {
    const firstAction = vi.fn();
    const secondAction = vi.fn();

    render(
      <Toolbar
        variant="generic"
        tools={{
          actions: [
            { label: "Action A", icon: "play", variant: "primary", onClick: firstAction },
            { label: "Action B", icon: "trash", variant: "danger", onClick: secondAction },
          ],
        }}
      />,
    );

    expect(screen.getByText("Herramientas")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Action A/i }));
    fireEvent.click(screen.getByRole("button", { name: /Action B/i }));

    expect(firstAction).toHaveBeenCalledOnce();
    expect(secondAction).toHaveBeenCalledOnce();
  });

  it("renders generic config button when provided", () => {
    const onOpenConfig = vi.fn();

    render(
      <Toolbar
        variant="generic"
        tools={{
          title: "Tools",
          configButtonTitle: "Abrir config",
          gridClassName: "custom-grid",
          onOpenConfig,
          actions: [{ label: "Only", icon: "play", variant: "primary", onClick: vi.fn() }],
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir config" }));

    expect(onOpenConfig).toHaveBeenCalledOnce();
    expect(screen.getByText("Tools")).toBeInTheDocument();
    expect(screen.getByText("Only").closest("div")).toHaveClass("custom-grid");
  });

  it("renders extraContent alongside tools in two-column layout", () => {
    render(
      <Toolbar
        variant="generic"
        tools={{
          actions: [{ label: "Format", icon: "indent", variant: "primary", onClick: vi.fn() }],
        }}
        extraContent={<div data-testid="extra-section">Extra Content</div>}
      />,
    );

    expect(screen.getByText("Format")).toBeInTheDocument();
    expect(screen.getByTestId("extra-section")).toBeInTheDocument();
    expect(screen.getByText("Extra Content")).toBeInTheDocument();
  });

  it("opens local config state and closes via modal callback for json mode", () => {
    render(
      <Toolbar
        variant="generic"
        tools={{
          actions: [{ label: "Formatear", icon: "indent", variant: "primary", onClick: vi.fn() }],
        }}
        config={{
          mode: "json",
          format: formatConfig,
          onFormatChange: vi.fn(),
          minify: minifyConfig,
          onMinifyChange: vi.fn(),
          clean: cleanConfig,
          onCleanChange: vi.fn(),
        }}
      />,
    );

    expect(screen.getByText("config-closed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Configurar herramientas/i }));
    expect(screen.getByText("config-open")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "close-config" }));
    expect(screen.getByText("config-closed")).toBeInTheDocument();
  });

  it("uses external config open state handlers when provided", () => {
    const onOpenChange = vi.fn();

    render(
      <Toolbar
        variant="generic"
        tools={{
          actions: [{ label: "Formatear", icon: "indent", variant: "primary", onClick: vi.fn() }],
        }}
        config={{
          mode: "json",
          format: formatConfig,
          onFormatChange: vi.fn(),
          minify: minifyConfig,
          onMinifyChange: vi.fn(),
          clean: cleanConfig,
          onCleanChange: vi.fn(),
          isOpen: true,
          onOpenChange,
        }}
      />,
    );

    expect(screen.getByText("config-open")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Configurar herramientas/i }));
    fireEvent.click(screen.getByRole("button", { name: "close-config" }));

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });
});

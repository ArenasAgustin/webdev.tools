import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toolbar } from "./Toolbar";
import type { FormatConfig, MinifyConfig, CleanConfig } from "@/types/json";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";

vi.mock("@/components/common/ConfigModal", () => ({
  ConfigModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <div data-testid="config-modal">
      <span>{isOpen ? "config-open" : "config-closed"}</span>
      <button onClick={onClose}>close-config</button>
    </div>
  ),
}));

vi.mock("@/components/common/TipsModal", () => ({
  TipsModal: ({
    isOpen,
    onTryExample,
  }: {
    isOpen: boolean;
    onTryExample: (code: string) => void;
  }) => (
    <div data-testid="tips-modal">
      <span>{isOpen ? "tips-open" : "tips-closed"}</span>
      <button onClick={() => onTryExample("$.users[0]")}>try-tip</button>
    </div>
  ),
}));

vi.mock("@/components/common/JsonPathHistoryModal", () => ({
  JsonPathHistoryModal: ({
    isOpen,
    onReuse,
  }: {
    isOpen: boolean;
    onReuse: (expression: string) => void;
  }) => (
    <div data-testid="history-modal">
      <span>{isOpen ? "history-open" : "history-closed"}</span>
      <button onClick={() => onReuse("$.history")}>reuse-history</button>
    </div>
  ),
}));

describe("Toolbar", () => {
  const formatConfig: FormatConfig = {
    indent: 2,
    sortKeys: false,
    autoCopy: false,
  };
  const minifyConfig: MinifyConfig = {
    removeSpaces: true,
    sortKeys: false,
    autoCopy: false,
  };
  const cleanConfig: CleanConfig = {
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

  it("handles json actions and jsonPath input", () => {
    const onFormat = vi.fn();
    const onMinify = vi.fn();
    const onClean = vi.fn();
    const onFilter = vi.fn();
    const onJsonPathChange = vi.fn();

    render(
      <Toolbar
        variant="json"
        actions={{ onFormat, onMinify, onClean, onFilter }}
        jsonPath={{ value: "", onChange: onJsonPathChange }}
        config={{
          format: formatConfig,
          onFormatChange: vi.fn(),
          minify: minifyConfig,
          onMinifyChange: vi.fn(),
          clean: cleanConfig,
          onCleanChange: vi.fn(),
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Formatear/i }));
    fireEvent.click(screen.getByRole("button", { name: /Minificar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Limpiar vacíos/i }));
    fireEvent.click(screen.getByRole("button", { name: /Aplicar filtro JSONPath/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /Expresion JSONPath/i }), {
      target: { value: "$.data" },
    });

    expect(onFormat).toHaveBeenCalledOnce();
    expect(onMinify).toHaveBeenCalledOnce();
    expect(onClean).toHaveBeenCalledOnce();
    expect(onFilter).toHaveBeenCalledOnce();
    expect(onJsonPathChange).toHaveBeenCalledWith("$.data");
  });

  it("opens local config state and closes via modal callback", () => {
    render(
      <Toolbar
        variant="json"
        actions={{ onFormat: vi.fn(), onMinify: vi.fn(), onClean: vi.fn(), onFilter: vi.fn() }}
        jsonPath={{ value: "", onChange: vi.fn() }}
        config={{
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
        variant="json"
        actions={{ onFormat: vi.fn(), onMinify: vi.fn(), onClean: vi.fn(), onFilter: vi.fn() }}
        jsonPath={{ value: "", onChange: vi.fn() }}
        config={{
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

  it("handles tips modal interactions", () => {
    const onJsonPathChange = vi.fn();
    const onShow = vi.fn();

    render(
      <Toolbar
        variant="json"
        actions={{ onFormat: vi.fn(), onMinify: vi.fn(), onClean: vi.fn(), onFilter: vi.fn() }}
        jsonPath={{ value: "", onChange: onJsonPathChange }}
        config={{
          format: formatConfig,
          onFormatChange: vi.fn(),
          minify: minifyConfig,
          onMinifyChange: vi.fn(),
          clean: cleanConfig,
          onCleanChange: vi.fn(),
        }}
        tips={{
          config: { tips: [{ icon: "info", color: "yellow", text: "tip" }] },
          onShow,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Ver tips de filtros/i }));
    expect(onShow).toHaveBeenCalledOnce();
    expect(screen.getByText("tips-open")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "try-tip" }));
    expect(onJsonPathChange).toHaveBeenCalledWith("$.users[0]");
  });

  it("handles history modal interactions", () => {
    const historyItems: JsonPathHistoryItem[] = [
      { id: "1", expression: "$.users", timestamp: 1, frequency: 1 },
    ];
    const onReuse = vi.fn();

    render(
      <Toolbar
        variant="json"
        actions={{ onFormat: vi.fn(), onMinify: vi.fn(), onClean: vi.fn(), onFilter: vi.fn() }}
        jsonPath={{ value: "", onChange: vi.fn() }}
        history={{
          items: historyItems,
          onReuse,
          onDelete: vi.fn(),
          onClear: vi.fn(),
        }}
        config={{
          format: formatConfig,
          onFormatChange: vi.fn(),
          minify: minifyConfig,
          onMinifyChange: vi.fn(),
          clean: cleanConfig,
          onCleanChange: vi.fn(),
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Historial de filtros/i }));
    expect(screen.getByText("history-open")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "reuse-history" }));
    expect(onReuse).toHaveBeenCalledWith("$.history");
  });
});

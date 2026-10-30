import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import i18n from "i18next";
import { ConfigModal } from "@/components/common/ConfigModal";

vi.mock("@/services/storage", () => ({
  saveJsonToolsConfig: vi.fn(),
  removeJsonToolsConfig: vi.fn(),
  saveJsToolsConfig: vi.fn(),
  removeJsToolsConfig: vi.fn(),
}));

function renderJsonConfig() {
  render(
    <ConfigModal
      isOpen
      onClose={vi.fn()}
      formatConfig={{ indentSize: 2, sortKeys: false, autoCopy: false }}
      onFormatConfigChange={vi.fn()}
      minifyConfig={{ removeSpaces: true, sortKeys: false, autoCopy: false }}
      onMinifyConfigChange={vi.fn()}
      cleanConfig={{
        removeNull: true,
        removeUndefined: true,
        removeEmptyString: false,
        removeEmptyArray: false,
        removeEmptyObject: false,
        outputFormat: "format",
        autoCopy: false,
      }}
      onCleanConfigChange={vi.fn()}
    />,
  );
}

describe("ConfigModal indent options", () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage("es"));
  });

  it("labels the indent options in the UI language", async () => {
    await act(() => i18n.changeLanguage("en"));
    renderJsonConfig();

    expect(screen.getByRole("button", { name: "2 spaces" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4 spaces" })).toBeInTheDocument();
    expect(screen.queryByText(/espacios/)).not.toBeInTheDocument();
  });

  it("names the clean output format group in the UI language", () => {
    renderJsonConfig();

    expect(screen.getByRole("group", { name: "Formato de salida" })).toBeInTheDocument();
    expect(screen.queryByText("cleanOutputMode")).not.toBeInTheDocument();
  });

  it("keeps the Spanish labels in Spanish", () => {
    renderJsonConfig();

    expect(screen.getByRole("button", { name: "4 espacios" })).toBeInTheDocument();
  });

});

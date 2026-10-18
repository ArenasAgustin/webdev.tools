import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const storedValues: Record<string, unknown> = {};

const { getItemMock, setItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn((key: string): unknown => storedValues[key] ?? null),
  setItemMock: vi.fn((key: string, value: unknown) => {
    storedValues[key] = value;
    return true;
  }),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  STORAGE_KEYS: {
    URL_MODE: "urlMode",
    URL_VARIANT: "urlVariant",
    URL_INPUT: "urlInput",
    URL_OPTIONS: "urlOptions",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

const esTranslations: Record<string, string> = {
  "url.modeAuto": "Auto",
  "url.modeAutoDetected": "Auto ({{mode}})",
  "url.modeEncode": "Codificar",
  "url.modeDecode": "Decodificar",
  "url.variantComponent": "Componente",
  "url.variantUri": "URI completa",
  "url.variantForm": "Formulario",
  "url.inputLabel": "Entrada",
  "url.outputLabel": "Salida",
  "url.clear": "Limpiar",
  "url.strict": "Estricto",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) =>
      (esTranslations[key] ?? key).replace(
        /{{(\w+)}}/g,
        (_m, name: string) => options?.[name] ?? "",
      ),
  }),
}));

import { UrlPlayground } from "./UrlPlayground";

const getInput = () => screen.getByLabelText<HTMLTextAreaElement>("Entrada");
const pressed = (name: string | RegExp) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("UrlPlayground persistence", () => {
  beforeEach(() => {
    Object.keys(storedValues).forEach((k) => delete storedValues[k]);
    vi.clearAllMocks();
  });

  it("restores input, mode, variant and strict from storage", () => {
    storedValues.urlInput = "a%21b";
    storedValues.urlMode = "decode";
    storedValues.urlVariant = "form";
    storedValues.urlOptions = { strict: true };

    render(<UrlPlayground />);

    expect(getInput().value).toBe("a%21b");
    expect(pressed("Decodificar")).toBe("true");
    expect(pressed("Formulario")).toBe("true");
    expect(screen.getByRole("checkbox", { name: "Estricto" })).toBeChecked();
  });

  it("writes mode, variant, input and options on change", () => {
    render(<UrlPlayground />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Estricto" }));
    fireEvent.click(screen.getByRole("button", { name: "Codificar" }));
    fireEvent.click(screen.getByRole("button", { name: "URI completa" }));
    fireEvent.change(getInput(), { target: { value: "x y" } });

    expect(setItemMock).toHaveBeenCalledWith("urlMode", "encode");
    expect(setItemMock).toHaveBeenCalledWith("urlVariant", "uri");
    expect(setItemMock).toHaveBeenCalledWith("urlInput", "x y");
    expect(setItemMock).toHaveBeenCalledWith("urlOptions", { strict: true });
  });

  it("falls back to auto for an invalid stored mode", () => {
    storedValues.urlMode = "bogus";
    render(<UrlPlayground />);
    expect(pressed(/^auto/i)).toBe("true");
  });

  it.each(["bogus", 42])("falls back to component for invalid stored variant %j", (bad) => {
    storedValues.urlVariant = bad;
    render(<UrlPlayground />);
    expect(pressed("Componente")).toBe("true");
  });

  it.each(["x", { strict: "yes" }])("falls back to strict off for invalid options %j", (bad) => {
    storedValues.urlOptions = bad;
    render(<UrlPlayground />);
    expect(screen.getByRole("checkbox", { name: "Estricto" })).not.toBeChecked();
  });

  it("stores an empty string when cleared", () => {
    storedValues.urlInput = "abc";
    render(<UrlPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /Limpiar/ }));
    expect(setItemMock).toHaveBeenCalledWith("urlInput", "");
  });
});

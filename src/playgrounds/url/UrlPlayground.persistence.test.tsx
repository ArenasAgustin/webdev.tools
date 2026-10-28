import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const storedValues: Record<string, unknown> = {};

const { getItemMock, setItemMock, removeItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn((key: string): unknown => storedValues[key] ?? null),
  setItemMock: vi.fn((key: string, value: unknown) => {
    storedValues[key] = value;
    return true;
  }),
  removeItemMock: vi.fn((key: string) => {
    delete storedValues[key];
    return true;
  }),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  STORAGE_KEYS: {
    URL_MODE: "urlMode",
    URL_VARIANT: "urlVariant",
    URL_INPUT: "urlInput",
    URL_OPTIONS: "urlOptions",
  },
}));

vi.mock("@/hooks/useToast", () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
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

  it("restores mode, variant and strict but never the input text", () => {
    storedValues.urlInput = "token%3Dsecret";
    storedValues.urlMode = "decode";
    storedValues.urlVariant = "form";
    storedValues.urlOptions = { strict: true };

    render(<UrlPlayground />);

    expect(getInput().value).not.toBe("token%3Dsecret");
    // the copy stored by earlier versions is purged
    expect(removeItemMock).toHaveBeenCalledWith("urlInput");
    expect(storedValues.urlInput).toBeUndefined();
    expect(pressed("Decodificar")).toBe("true");
    expect(pressed("Formulario")).toBe("true");
    expect(screen.getByRole("checkbox", { name: "Estricto" })).toBeChecked();
  });

  it("writes mode, variant and options on change, but not the input", () => {
    render(<UrlPlayground />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Estricto" }));
    fireEvent.click(screen.getByRole("button", { name: "Codificar" }));
    fireEvent.click(screen.getByRole("button", { name: "URI completa" }));
    fireEvent.change(getInput(), { target: { value: "x y" } });

    expect(setItemMock).toHaveBeenCalledWith("urlMode", "encode");
    expect(setItemMock).toHaveBeenCalledWith("urlVariant", "uri");
    expect(setItemMock).not.toHaveBeenCalledWith("urlInput", expect.anything());
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

  it("clears the input in memory without storing it", () => {
    render(<UrlPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /Limpiar/ }));
    expect(getInput().value).toBe("");
    expect(setItemMock).not.toHaveBeenCalledWith("urlInput", expect.anything());
  });
});

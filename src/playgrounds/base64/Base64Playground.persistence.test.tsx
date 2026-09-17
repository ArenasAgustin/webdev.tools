import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const storedValues: Record<string, unknown> = {};

const { getItemMock, setItemMock } = vi.hoisted(() => ({
  getItemMock: vi.fn((key: string) => storedValues[key] ?? null),
  setItemMock: vi.fn((key: string, value: unknown) => {
    storedValues[key] = value;
    return true;
  }),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  STORAGE_KEYS: {
    BASE64_INPUT_MODE: "base64InputMode",
    BASE64_INPUT: "base64Input",
    BASE64_MODE: "base64Mode",
    BASE64_OPTIONS: "base64Options",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

const esTranslations: Record<string, string> = {
  "base64.modeAuto": "Auto",
  "base64.modeAutoDetected": "Auto ({{mode}})",
  "base64.modeEncode": "Codificar",
  "base64.modeDecode": "Decodificar",
  "base64.inputTypeText": "Texto",
  "base64.inputTypeFile": "Archivo",
  "base64.inputLabel": "Entrada",
  "base64.inputPlaceholderEncode": "Ingresá el texto para codificar...",
  "base64.inputPlaceholderDecode": "Ingresá el Base64 para decodificar...",
  "base64.outputLabel": "Salida",
  "base64.outputPlaceholder": "El resultado aparecerá aquí",
  "base64.fileDropLabel": "Seleccionar archivo — clic o arrastrar aquí",
  "base64.dropFileHere": "Arrastrá un archivo o hacé clic aquí",
  "base64.changeFile": "Cambiar archivo",
  "base64.urlSafe": "URL-safe",
  "base64.padding": "Padding",
  "base64.copy": "Copiar",
  "base64.copyError": "No se pudo copiar al portapapeles",
  "base64.swap": "Intercambiar",
  "base64.clear": "Limpiar",
  "base64.errorInvalidCharacter": "La entrada contiene un carácter fuera del alfabeto Base64",
  "base64.errorInvalidLength": "La longitud de la entrada no es una longitud Base64 válida",
  "base64.errorInvalidPadding": "La entrada tiene un padding Base64 inválido",
  "base64.errorInvalidUtf8": "Los bytes decodificados no son texto UTF-8 válido",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const template = esTranslations[key] ?? key;
      if (!options) return template;
      return template.replace(/{{(\w+)}}/g, (_match, name: string) => options[name] ?? "");
    },
  }),
}));

import { Base64Playground } from "./Base64Playground";

describe("Base64Playground persistence", () => {
  beforeEach(() => {
    Object.keys(storedValues).forEach((k) => delete storedValues[k]);
    getItemMock.mockClear();
    setItemMock.mockClear();
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);
    setItemMock.mockImplementation((key: string, value: unknown) => {
      storedValues[key] = value;
      return true;
    });
  });

  it("input, mode and options are restored from storage", () => {
    storedValues.base64Input = "SGVsbG8=";
    storedValues.base64Mode = "decode";
    storedValues.base64Options = { urlSafe: true, padding: false };
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    expect(input.value).toBe("SGVsbG8=");

    const decodeBtn = screen.getByRole("button", { name: /^decodificar$/i });
    expect(decodeBtn).toHaveAttribute("aria-pressed", "true");

    const urlSafeCheckbox = screen.getByRole("checkbox", { name: "URL-safe" });
    const paddingCheckbox = screen.getByRole("checkbox", { name: "Padding" });
    expect(urlSafeCheckbox).toBeChecked();
    expect(paddingCheckbox).not.toBeChecked();
  });

  it("inputMode='file' restored → drop zone is shown instead of the textarea", () => {
    storedValues.base64InputMode = "file";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<Base64Playground />);

    expect(screen.queryByLabelText("Entrada")).not.toBeInTheDocument();
    expect(screen.getByText(/arrastr[aá] un archivo/i)).toBeInTheDocument();
  });

  it("fileState, result and clipboardError are NOT present in storage", () => {
    render(<Base64Playground />);

    const allStoredKeys = Object.keys(storedValues);
    const forbiddenKeys = ["fileState", "result", "clipboardError"];

    for (const forbidden of forbiddenKeys) {
      expect(allStoredKeys).not.toContain(forbidden);
    }
  });
});

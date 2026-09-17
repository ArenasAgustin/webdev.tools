import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { getItemMock, setItemMock, clipboardWriteTextMock } = vi.hoisted(() => ({
  getItemMock: vi.fn(() => null),
  setItemMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
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
  "base64.inputLabel": "Entrada",
  "base64.inputPlaceholderEncode": "Ingresá el texto para codificar...",
  "base64.inputPlaceholderDecode": "Ingresá el Base64 para decodificar...",
  "base64.outputLabel": "Salida",
  "base64.outputPlaceholder": "El resultado aparecerá aquí",
  "base64.urlSafe": "URL-safe",
  "base64.padding": "Padding",
  "base64.copy": "Copiar",
  "base64.copyError": "No se pudo copiar al portapapeles",
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

describe("Base64Playground branches (text mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: clipboardWriteTextMock },
    });
    clipboardWriteTextMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("mode buttons toggle aria-pressed", () => {
    render(<Base64Playground />);

    const autoBtn = screen.getByRole("button", { name: /auto/i });
    const encodeBtn = screen.getByRole("button", { name: /^codificar$/i });
    const decodeBtn = screen.getByRole("button", { name: /^decodificar$/i });

    expect(autoBtn).toHaveAttribute("aria-pressed", "true");
    expect(encodeBtn).toHaveAttribute("aria-pressed", "false");
    expect(decodeBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(encodeBtn);
    expect(encodeBtn).toHaveAttribute("aria-pressed", "true");
    expect(autoBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(decodeBtn);
    expect(decodeBtn).toHaveAttribute("aria-pressed", "true");
    expect(encodeBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("auto-detect: plain text encodes, base64-like input decodes", () => {
    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    const output = screen.getByLabelText<HTMLTextAreaElement>("Salida");

    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(output.value).toBe("SGVsbG8gV29ybGQ=");

    fireEvent.change(input, { target: { value: "SGVsbG8gV29ybGQ=" } });
    expect(output.value).toBe("Hello World");
  });

  it("manual mode override is not flipped back by auto-detect", () => {
    render(<Base64Playground />);

    const decodeBtn = screen.getByRole("button", { name: /^decodificar$/i });
    fireEvent.click(decodeBtn);
    expect(decodeBtn).toHaveAttribute("aria-pressed", "true");

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    // Plain text would auto-detect as "encode", but mode is manually pinned to decode.
    fireEvent.change(input, { target: { value: "not base64 at all!" } });

    expect(decodeBtn).toHaveAttribute("aria-pressed", "true");
    // Decoding plain text with spaces/punctuation fails -> inline error.
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("urlSafe and padding checkboxes change the encoded output", () => {
    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    const output = screen.getByLabelText<HTMLTextAreaElement>("Salida");
    fireEvent.change(input, { target: { value: "\xfb\xff\xbf" } });

    const urlSafeCheckbox = screen.getByRole("checkbox", { name: "URL-safe" });
    const paddingCheckbox = screen.getByRole("checkbox", { name: "Padding" });

    const before = output.value;
    fireEvent.click(urlSafeCheckbox);
    expect(output.value).not.toBe(before);
    expect(output.value).not.toMatch(/[+/]/);

    fireEvent.click(paddingCheckbox);
    expect(output.value.endsWith("=")).toBe(false);
  });

  it("invalid input in decode mode shows a translated inline error without throwing", () => {
    render(<Base64Playground />);

    fireEvent.click(screen.getByRole("button", { name: /^decodificar$/i }));
    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");

    expect(() => {
      fireEvent.change(input, { target: { value: "abc$" } });
    }).not.toThrow();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(
      "La entrada contiene un carácter fuera del alfabeto Base64",
    );
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("copy button copies the output and shows an error message on clipboard failure", async () => {
    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    fireEvent.change(input, { target: { value: "Hello World" } });

    const copyBtn = screen.getByRole("button", { name: /^copiar$/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(clipboardWriteTextMock).toHaveBeenCalledWith("SGVsbG8gV29ybGQ=");

    clipboardWriteTextMock.mockRejectedValueOnce(new Error("denied"));
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(screen.getByText("No se pudo copiar al portapapeles")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.queryByText("No se pudo copiar al portapapeles")).not.toBeInTheDocument();
  });

  it("copy button is disabled when output is empty", () => {
    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    fireEvent.change(input, { target: { value: "" } });

    const copyBtn = screen.getByRole("button", { name: /^copiar$/i });
    expect(copyBtn).toBeDisabled();
  });

  it("clear button resets the input and output", () => {
    render(<Base64Playground />);

    const input = screen.getByLabelText<HTMLTextAreaElement>("Entrada");
    const output = screen.getByLabelText<HTMLTextAreaElement>("Salida");
    fireEvent.change(input, { target: { value: "Hello World" } });
    expect(input.value).toBe("Hello World");
    expect(output.value).not.toBe("");

    fireEvent.click(screen.getByRole("button", { name: /^limpiar$/i }));

    expect(input.value).toBe("");
    expect(output.value).toBe("");
  });
});

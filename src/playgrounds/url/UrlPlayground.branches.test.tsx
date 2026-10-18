import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { getItemMock, setItemMock, clipboardWriteTextMock } = vi.hoisted(() => ({
  getItemMock: vi.fn((): unknown => null),
  setItemMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
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

const esTranslations: Record<string, string> = {
  "url.modeGroupLabel": "Modo de conversión",
  "url.modeAuto": "Auto",
  "url.modeAutoDetected": "Auto ({{mode}})",
  "url.modeEncode": "Codificar",
  "url.modeDecode": "Decodificar",
  "url.variantGroupLabel": "Variante de codificación",
  "url.variantComponent": "Componente",
  "url.variantUri": "URI completa",
  "url.variantForm": "Formulario",
  "url.inputLabel": "Entrada",
  "url.outputLabel": "Salida",
  "url.copy": "Copiar",
  "url.copyError": "No se pudo copiar al portapapeles",
  "url.clear": "Limpiar",
  "url.swap": "Intercambiar",
  "url.strict": "Estricto (RFC 3986)",
  "url.errorMalformedSequence": "Secuencia porcentual malformada",
  "url.errorInvalidSurrogate": "Sustituto UTF-16 sin par",
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
const getOutput = () => screen.getByLabelText<HTMLTextAreaElement>("Salida");
const typeInput = (value: string) => fireEvent.change(getInput(), { target: { value } });
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));

describe("UrlPlayground branches (core)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getItemMock.mockReturnValue(null);
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

  it("defaults to auto/component and toggles aria-pressed in labelled groups", () => {
    render(<UrlPlayground />);
    const pressed = (name: string | RegExp) =>
      screen.getByRole("button", { name }).getAttribute("aria-pressed");

    expect(pressed(/^auto/i)).toBe("true");
    expect(pressed("Componente")).toBe("true");
    expect(screen.getByRole("group", { name: "Modo de conversión" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Variante de codificación" })).toBeInTheDocument();

    click("Decodificar");
    click("URI completa");
    expect(pressed("Decodificar")).toBe("true");
    expect(pressed(/^auto/i)).toBe("false");
    expect(pressed("URI completa")).toBe("true");
    expect(pressed("Componente")).toBe("false");
  });

  it("auto mode detects direction and labels it", () => {
    render(<UrlPlayground />);
    typeInput("a b");
    expect(getOutput().value).toBe("a%20b");
    expect(screen.getByRole("button", { name: "Auto (encode)" })).toBeInTheDocument();

    typeInput("a%20b");
    expect(getOutput().value).toBe("a b");
    expect(screen.getByRole("button", { name: "Auto (decode)" })).toBeInTheDocument();
  });

  it("explicit modes skip detection and hide the detected label", () => {
    render(<UrlPlayground />);
    click("Codificar");
    typeInput("a%20b");
    expect(getOutput().value).toBe("a%2520b");

    click("Decodificar");
    expect(getOutput().value).toBe("a b");
    expect(screen.queryByRole("button", { name: /\(/ })).not.toBeInTheDocument();
  });

  it("form variant encodes spaces as plus", () => {
    render(<UrlPlayground />);
    click("Formulario");
    typeInput("a b");
    expect(getOutput().value).toBe("a+b");
  });

  it("empty input yields empty output, no alert and aria-invalid false", () => {
    render(<UrlPlayground />);
    typeInput("");
    expect(getOutput().value).toBe("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getInput()).toHaveAttribute("aria-invalid", "false");
  });

  it("shows localized alerts with aria-invalid and clears them on valid input", () => {
    render(<UrlPlayground />);
    click("Decodificar");
    typeInput("%zz");
    expect(screen.getByRole("alert")).toHaveTextContent("Secuencia porcentual malformada");
    expect(getInput()).toHaveAttribute("aria-invalid", "true");
    expect(getInput()).toHaveAttribute("aria-describedby", "url-error");
    expect(getOutput().value).toBe("");

    click("Codificar");
    typeInput("\uD800");
    expect(screen.getByRole("alert")).toHaveTextContent("Sustituto UTF-16 sin par");

    typeInput("a b");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(getInput()).toHaveAttribute("aria-invalid", "false");
  });

  it("surfaces malformed sequences found by auto-detected decode", () => {
    render(<UrlPlayground />);
    typeInput("%E0%A4%A");
    expect(screen.getByRole("alert")).toHaveTextContent("Secuencia porcentual malformada");
  });

  it("copy writes the output, is disabled on empty/error and shows no success message", async () => {
    render(<UrlPlayground />);
    const copy = screen.getByRole("button", { name: /Copiar/ });

    typeInput("");
    expect(copy).toBeDisabled();
    click("Decodificar");
    typeInput("%zz");
    expect(copy).toBeDisabled();

    click("Codificar");
    typeInput("a b");
    expect(copy).toBeEnabled();
    await act(async () => {
      fireEvent.click(copy);
    });
    expect(clipboardWriteTextMock).toHaveBeenCalledWith("a%20b");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows a transient copy error on clipboard failure and cleans up on unmount", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    clipboardWriteTextMock.mockRejectedValue(new Error("denied"));
    const { unmount } = render(<UrlPlayground />);
    typeInput("a b");
    const copy = screen.getByRole("button", { name: /Copiar/ });

    await act(async () => {
      fireEvent.click(copy);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    await act(async () => {
      fireEvent.click(copy);
    });
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByRole("status")).toHaveTextContent("No se pudo copiar al portapapeles");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copy);
    });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clear empties input and error but keeps mode", () => {
    render(<UrlPlayground />);
    click("Decodificar");
    typeInput("%zz");
    click(/Limpiar/);

    expect(getInput().value).toBe("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decodificar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("swap exchanges input/output, makes the flipped mode explicit and keeps the variant", () => {
    render(<UrlPlayground />);
    click("URI completa");
    typeInput("a b");
    expect(screen.getByRole("button", { name: "Auto (encode)" })).toBeInTheDocument();

    click(/Intercambiar/);
    expect(getInput().value).toBe("a%20b");
    expect(getOutput().value).toBe("a b");
    expect(screen.getByRole("button", { name: "Decodificar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "URI completa" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    click(/Intercambiar/);
    expect(getInput().value).toBe("a b");
    expect(screen.getByRole("button", { name: "Codificar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("swap is disabled on empty output or error", () => {
    render(<UrlPlayground />);
    const swap = screen.getByRole("button", { name: /Intercambiar/ });
    typeInput("");
    expect(swap).toBeDisabled();
    click("Decodificar");
    typeInput("%zz");
    expect(swap).toBeDisabled();
    typeInput("a%20b");
    expect(swap).toBeEnabled();
  });

  it("strict escapes !'()* when encoding", () => {
    render(<UrlPlayground />);
    click("Codificar");
    typeInput("a!b");
    expect(getOutput().value).toBe("a!b");

    const strict = screen.getByRole("checkbox", { name: "Estricto (RFC 3986)" });
    expect(strict).not.toBeChecked();
    fireEvent.click(strict);
    expect(strict).toBeChecked();
    expect(getOutput().value).toBe("a%21b");
  });

  it("strict has no effect on decode and is disabled (but rendered) for uri", () => {
    render(<UrlPlayground />);
    const strict = screen.getByRole("checkbox", { name: "Estricto (RFC 3986)" });
    fireEvent.click(strict);
    click("Decodificar");
    typeInput("a%21b");
    expect(getOutput().value).toBe("a!b");

    click("URI completa");
    expect(strict).toBeDisabled();
    click("Formulario");
    expect(strict).toBeEnabled();
  });

  it("coerces invalid stored values to defaults", () => {
    getItemMock.mockImplementation(
      ((key: string) =>
        ({ urlMode: "bogus", urlVariant: 42, urlInput: 7 })[key] ?? null) as () => unknown,
    );
    render(<UrlPlayground />);

    expect(screen.getByRole("button", { name: /^auto/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Componente" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(getInput().value).toBe("https://example.com/search?q=hello world&lang=es");
  });
});

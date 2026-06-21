import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const {
  getItemMock,
  setItemMock,
  generateAllHashesMock,
  generateHashFromFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  getItemMock: vi.fn(() => null),
  setItemMock: vi.fn(),
  generateAllHashesMock: vi.fn(),
  generateHashFromFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  STORAGE_KEYS: {
    HASH_INPUT_MODE: "hashInputMode",
    HASH_TEXT_INPUT: "hashTextInput",
    HASH_OUTPUT_CASE: "hashOutputCase",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

vi.mock("./hash.utils", async (importOriginal) => {
  const original = await importOriginal<typeof import("./hash.utils")>();
  return {
    ...original,
    generateAllHashes: generateAllHashesMock,
    generateHashFromFile: generateHashFromFileMock,
  };
});

import { HashPlayground } from "./HashPlayground";

const FAKE_HASHES = [
  { algorithm: "sha1", hash: "aabbcc" },
  { algorithm: "sha256", hash: "ddeeff" },
  { algorithm: "sha512", hash: "112233" },
];

describe("HashPlayground branches", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    generateAllHashesMock.mockResolvedValue(FAKE_HASHES);
    generateHashFromFileMock.mockResolvedValue("filehash123");
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

  it("inputMode toggle switches between text and file UI", () => {
    render(<HashPlayground />);

    // Default is text mode — textarea visible
    expect(screen.getByPlaceholderText(/ingresa el texto/i)).toBeInTheDocument();

    // Switch to file mode
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    expect(screen.queryByPlaceholderText(/ingresa el texto/i)).not.toBeInTheDocument();

    // Switch back to text mode
    fireEvent.click(screen.getByRole("button", { name: /texto/i }));
    expect(screen.getByPlaceholderText(/ingresa el texto/i)).toBeInTheDocument();
  });

  it("empty text guard returns early without calling generateAllHashes", async () => {
    render(<HashPlayground />);

    // Clear the textarea
    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesMock).not.toHaveBeenCalled();
  });

  it("text mode: generates hashes and displays results", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "hello" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesMock).toHaveBeenCalledWith("hello", "lowercase");
    expect(screen.getByText("aabbcc")).toBeInTheDocument();
    expect(screen.getByText("ddeeff")).toBeInTheDocument();
    expect(screen.getByText("112233")).toBeInTheDocument();
  });

  it("outputCase toggle changes case argument passed to generateAllHashes", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "test" } });

    // Enable uppercase
    const uppercaseCheckbox = screen.getByRole("checkbox", { name: /mayúsculas/i });
    fireEvent.click(uppercaseCheckbox);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesMock).toHaveBeenCalledWith("test", "uppercase");

    // Disable uppercase again
    fireEvent.click(uppercaseCheckbox);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesMock).toHaveBeenCalledWith("test", "lowercase");
  });

  it("clipboard copy success: copies hash value", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "copy-test" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const copyButtons = screen.getAllByRole("button", { name: /copiar hash/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(clipboardWriteTextMock).toHaveBeenCalledWith("aabbcc");
  });

  it("clipboard copy error: shows clipboardError message", async () => {
    clipboardWriteTextMock.mockRejectedValueOnce(new Error("denied"));

    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "error-test" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const copyButtons = screen.getAllByRole("button", { name: /copiar hash/i });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(screen.getByText(/no se pudo copiar/i)).toBeInTheDocument();

    // Error message disappears after 2000ms
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.queryByText(/no se pudo copiar/i)).not.toBeInTheDocument();
  });

  it("compare logic: shows match/no-match result", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingresa el texto/i);
    fireEvent.change(textarea, { target: { value: "compare-test" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const compareInput = screen.getByPlaceholderText(/ingresa un hash para comparar/i);

    // Compare with matching hash (sha1)
    fireEvent.change(compareInput, { target: { value: "aabbcc" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByText(/coincide/i)).toBeInTheDocument();

    // Compare with non-matching hash
    fireEvent.change(compareInput, { target: { value: "xxxxxx" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByText(/no coincide/i)).toBeInTheDocument();
  });

  it("compare guard: empty compareValue or no results — does nothing", () => {
    render(<HashPlayground />);

    // No results generated yet, compareValue empty
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.queryByText(/coincide/i)).not.toBeInTheDocument();
  });
});

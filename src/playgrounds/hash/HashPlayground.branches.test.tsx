import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const {
  getItemMock,
  setItemMock,
  generateAllHashesMock,
  generateAllHashesFromFileMock,
  clipboardWriteTextMock,
} = vi.hoisted(() => ({
  getItemMock: vi.fn(() => null),
  setItemMock: vi.fn(),
  generateAllHashesMock: vi.fn(),
  generateAllHashesFromFileMock: vi.fn(),
  clipboardWriteTextMock: vi.fn(),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: vi.fn(() => true),
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
    generateAllHashesFromFile: generateAllHashesFromFileMock,
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
    generateAllHashesFromFileMock.mockResolvedValue(FAKE_HASHES);
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

  it("input type toggle exposes a named group and aria-pressed state", () => {
    render(<HashPlayground />);

    expect(screen.getByRole("group", { name: /tipo de entrada/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /texto/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archivo/i, pressed: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));

    expect(screen.getByRole("button", { name: /archivo/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /texto/i, pressed: false })).toBeInTheDocument();
  });

  it("inputMode toggle switches between text and file UI", () => {
    render(<HashPlayground />);

    // Default is text mode — textarea visible
    expect(screen.getByPlaceholderText(/ingres[aá] el texto/i)).toBeInTheDocument();

    // Switch to file mode
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    expect(screen.queryByPlaceholderText(/ingres[aá] el texto/i)).not.toBeInTheDocument();

    // Switch back to text mode
    fireEvent.click(screen.getByRole("button", { name: /texto/i }));
    expect(screen.getByPlaceholderText(/ingres[aá] el texto/i)).toBeInTheDocument();
  });

  it("file mode: hashes the file in one pass and shows the results", async () => {
    const { container } = render(<HashPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    const file = new File(["hello"], "a.txt", { type: "text/plain" });
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [file] } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesFromFileMock).toHaveBeenCalledTimes(1);
    expect(generateAllHashesFromFileMock).toHaveBeenCalledWith(file, "lowercase");
    expect(screen.getByText("ddeeff")).toBeInTheDocument();
  });

  it("file mode: resets the file input so the same file can be picked again", () => {
    const { container } = render(<HashPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    let value = "C:\\fakepath\\a.txt";
    Object.defineProperty(input, "value", {
      configurable: true,
      get: () => value,
      set: (next: string) => {
        value = next;
      },
    });

    fireEvent.change(input, { target: { files: [new File(["hello"], "a.txt")] } });

    expect(screen.getByText("a.txt")).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("file mode: shows a translated error when the file cannot be hashed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    generateAllHashesFromFileMock.mockRejectedValue(new DOMException("NotReadableError"));
    const { container } = render(<HashPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["x"], "a.txt")] } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/no se pudieron generar los hashes/i);
  });

  it("empty text guard returns early without calling generateAllHashes", async () => {
    render(<HashPlayground />);

    // Clear the textarea
    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(generateAllHashesMock).not.toHaveBeenCalled();
  });

  it("empty text: Generate shows a hint that disappears once text is typed", async () => {
    render(<HashPlayground />);
    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    expect(screen.getByRole("status")).toHaveTextContent(/ingres[aá] un texto/i);

    fireEvent.change(textarea, { target: { value: "x" } });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("file mode: shows small file sizes in bytes", () => {
    const { container } = render(<HashPlayground />);
    fireEvent.click(screen.getByRole("button", { name: /archivo/i }));
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["abc"], "a.txt")] } });

    expect(screen.getByText("3 B")).toBeInTheDocument();
  });

  it("text mode: generates hashes and displays results", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
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

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
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

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
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

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
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

  it("hides results once the text changes after generating", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });
    expect(screen.getByText("aabbcc")).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: "hello!" } });
    expect(screen.queryByText("aabbcc")).not.toBeInTheDocument();
  });

  it("ignores a slow result that lands after the text changed", async () => {
    let resolveHashes: (value: typeof FAKE_HASHES) => void = () => undefined;
    generateAllHashesMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveHashes = resolve;
      }),
    );
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "slow" } });
    fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    fireEvent.change(textarea, { target: { value: "other" } });
    await act(async () => {
      resolveHashes(FAKE_HASHES);
      await Promise.resolve();
    });

    expect(screen.queryByText("aabbcc")).not.toBeInTheDocument();
  });

  it("uppercase toggle updates the shown results without regenerating", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    fireEvent.click(screen.getByRole("checkbox", { name: /mayúsculas/i }));
    expect(screen.getByText("AABBCC")).toBeInTheDocument();
  });

  it("clears the compare verdict when the compared value or the input changes", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "hello" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const compareInput = screen.getByPlaceholderText(/ingres[aá] un hash para comparar/i);
    fireEvent.change(compareInput, { target: { value: "aabbcc" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByText(/coincide/i)).toBeInTheDocument();

    fireEvent.change(compareInput, { target: { value: "aabbc" } });
    expect(screen.queryByText(/coincide/i)).not.toBeInTheDocument();

    fireEvent.change(compareInput, { target: { value: "aabbcc" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    fireEvent.change(textarea, { target: { value: "changed" } });
    expect(screen.queryByText(/coincide/i)).not.toBeInTheDocument();
  });

  it("compare logic: shows match/no-match result", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "compare-test" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const compareInput = screen.getByPlaceholderText(/ingres[aá] un hash para comparar/i);

    // Compare with matching hash (sha1)
    fireEvent.change(compareInput, { target: { value: "aabbcc" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByText(/coincide/i)).toBeInTheDocument();

    // Compare with non-matching hash
    fireEvent.change(compareInput, { target: { value: "xxxxxx" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.getByText(/no coincide/i)).toBeInTheDocument();
  });

  it("compare ignores surrounding whitespace and letter case", async () => {
    render(<HashPlayground />);

    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    fireEvent.change(textarea, { target: { value: "compare-test" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /generar/i }));
    });

    const compareInput = screen.getByPlaceholderText(/ingres[aá] un hash para comparar/i);
    fireEvent.change(compareInput, { target: { value: "  AABBCC\n" } });
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));

    expect(screen.getByText(/coincide/i)).toBeInTheDocument();
    expect(screen.queryByText(/no coincide/i)).not.toBeInTheDocument();
  });

  it("compare guard: empty compareValue or no results — does nothing", () => {
    render(<HashPlayground />);

    // No results generated yet, compareValue empty
    fireEvent.click(screen.getByRole("button", { name: /comparar/i }));
    expect(screen.queryByText(/coincide/i)).not.toBeInTheDocument();
  });
});

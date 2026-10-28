import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const storedValues: Record<string, unknown> = {};

const { getItemMock, setItemMock, removeItemMock } = vi.hoisted(() => ({
  removeItemMock: vi.fn(() => true),
  getItemMock: vi.fn((key: string) => storedValues[key] ?? null),
  setItemMock: vi.fn((key: string, value: unknown) => {
    storedValues[key] = value;
    return true;
  }),
}));

vi.mock("@/services/storage", () => ({
  getItem: getItemMock,
  setItem: setItemMock,
  removeItem: removeItemMock,
  STORAGE_KEYS: {
    HASH_TEXT_INPUT: "hashTextInput",
    HASH_OUTPUT_CASE: "hashOutputCase",
    HASH_INPUT_MODE: "hashInputMode",
  },
}));

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

import { HashPlayground } from "./HashPlayground";

describe("HashPlayground persistence", () => {
  beforeEach(() => {
    Object.keys(storedValues).forEach((k) => delete storedValues[k]);
    getItemMock.mockClear();
    setItemMock.mockClear();
    removeItemMock.mockClear();
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);
    setItemMock.mockImplementation((key: string, value: unknown) => {
      storedValues[key] = value;
      return true;
    });
  });

  it("outputCase and inputMode are restored from storage", () => {
    storedValues.hashOutputCase = "uppercase";
    storedValues.hashInputMode = "text";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<HashPlayground />);

    // outputCase uppercase → checkbox "Mayúsculas" should be checked
    const uppercaseCheckbox = screen.getByRole("checkbox");
    expect(uppercaseCheckbox).toBeChecked();
  });

  it("inputMode='file' restored → fileInput starts null and results empty", () => {
    storedValues.hashInputMode = "file";
    getItemMock.mockImplementation((key: string) => storedValues[key] ?? null);

    render(<HashPlayground />);

    // In file mode, the drop zone should be visible (no file selected yet)
    expect(screen.queryByText(/resultados/i)).not.toBeInTheDocument();
    // The drag-and-drop area should be shown
    expect(
      screen.getByText(/arrastrá un archivo/i),
    ).toBeInTheDocument();
  });

  it("typed text is never written to storage and a legacy stored copy is purged", () => {
    storedValues.hashTextInput = "my secret";

    render(<HashPlayground />);

    // A previously persisted secret is not restored...
    const textarea = screen.getByPlaceholderText(/ingres[aá] el texto/i);
    expect(textarea).not.toHaveValue("my secret");
    fireEvent.change(textarea, { target: { value: "another secret" } });

    // ...new input is not persisted, and the old copy is removed from disk
    expect(setItemMock).not.toHaveBeenCalledWith("hashTextInput", expect.anything());
    expect(removeItemMock).toHaveBeenCalledWith("hashTextInput");
  });

  it("File, results, compareValue and clipboardError are NOT present in storage", () => {
    render(<HashPlayground />);

    const allStoredKeys = Object.keys(storedValues);
    const forbiddenKeys = ["fileInput", "results", "compareValue", "clipboardError"];

    for (const forbidden of forbiddenKeys) {
      expect(allStoredKeys).not.toContain(forbidden);
    }
  });
});

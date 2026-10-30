import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { useJsonPathHistory, resetDbPromise } from "./useJsonPathHistory";
import { STORAGE_KEYS, setItem } from "@/services/storage";

describe("useJsonPathHistory", () => {
  beforeEach(() => {
    // Reset the module's dbPromise singleton AND indexedDB before each test
    resetDbPromise();
    globalThis.indexedDB = new IDBFactory();
  });

  describe("addToHistory", () => {
    it("creates a new entry with the given expression", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.addToHistory("$.name");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      const item = result.current.history[0];
      expect(item.expression).toBe("$.name");
      expect(item.frequency).toBe(1);
      expect(item.id).toBeDefined();
      expect(item.timestamp).toBeGreaterThan(0);
    });

    it("ignores empty or whitespace-only expressions", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.addToHistory("   ");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0);
      });
    });

    it("increments frequency instead of duplicating when the same expression is added twice", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.addToHistory("$.name");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].frequency).toBe(1);
      });

      await act(async () => {
        await result.current.addToHistory("$.name");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].frequency).toBe(2);
      });
    });
  });

  describe("removeFromHistory", () => {
    it("removes the entry by its id", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.addToHistory("$.age");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      const id = result.current.history[0].id;

      await act(async () => {
        await result.current.removeFromHistory(id);
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0);
      });
    });

    it("only removes the targeted entry when multiple entries exist", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.addToHistory("$.name");
      });
      await act(async () => {
        await result.current.addToHistory("$.age");
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(2);
      });

      const idToRemove = result.current.history.find((item) => item.expression === "$.name")?.id;
      expect(idToRemove).toBeDefined();

      await act(async () => {
        await result.current.removeFromHistory(idToRemove!);
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
        expect(result.current.history[0].expression).toBe("$.age");
      });
    });
  });

  describe("clearHistory", () => {
    it("empties the history list completely", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      // Add items one at a time with proper waiting to avoid race conditions
      await act(async () => {
        await result.current.addToHistory("$.name");
      });
      await waitFor(() => {
        expect(result.current.history).toHaveLength(1);
      });

      await act(async () => {
        await result.current.addToHistory("$.age");
      });
      await waitFor(() => {
        expect(result.current.history).toHaveLength(2);
      });

      await act(async () => {
        await result.current.addToHistory("$.address");
      });
      await waitFor(() => {
        expect(result.current.history).toHaveLength(3);
      });

      await act(async () => {
        await result.current.clearHistory();
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0);
      });
    });

    it("works without errors when called on an already-empty history", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      await act(async () => {
        await result.current.clearHistory();
      });

      await waitFor(() => {
        expect(result.current.history).toHaveLength(0);
      });
    });
  });

  describe("cap of 20 items", () => {
    it("discards the oldest entry when the 21st item is added", async () => {
      const { result } = renderHook(() => useJsonPathHistory());

      // Add 20 items
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          await result.current.addToHistory(`$.field${i}`);
        });
      }

      await waitFor(() => {
        expect(result.current.history).toHaveLength(20);
      });

      // Add one more - should remove oldest
      await act(async () => {
        await result.current.addToHistory("$.newField");
      });
      await waitFor(() => {
        expect(result.current.history).toHaveLength(20);
      });

      // The oldest should be gone
      expect(result.current.history.find((h) => h.expression === "$.field0")).toBeUndefined();
      // The newest should be there
      expect(result.current.history.find((h) => h.expression === "$.newField")).toBeDefined();
    });
  });

  describe("legacy localStorage migration", () => {
    it("keeps the history when the saved list repeats an expression", async () => {
      const entries = new Map<string, string>();
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: {
          getItem: (key: string) => entries.get(key) ?? null,
          setItem: (key: string, value: string) => entries.set(key, value),
          removeItem: (key: string) => entries.delete(key),
          clear: () => entries.clear(),
        },
      });
      setItem(STORAGE_KEYS.JSONPATH_HISTORY, [
        { id: "1", expression: "$.a", timestamp: 1, frequency: 2 },
        { id: "2", expression: "$.a", timestamp: 5, frequency: 1 },
        { id: "3", expression: "$.b", timestamp: 3, frequency: 1 },
      ]);
      const { result } = renderHook(() => useJsonPathHistory());

      await waitFor(() => {
        expect(result.current.history).toHaveLength(2);
      });
      expect(result.current.history.map((h) => [h.expression, h.frequency, h.timestamp])).toEqual([
        ["$.a", 3, 5],
        ["$.b", 1, 3],
      ]);
      expect(entries.has(STORAGE_KEYS.JSONPATH_HISTORY)).toBe(false);
      Reflect.deleteProperty(window, "localStorage");
    });
  });

  describe("other tabs", () => {
    it("closes its connection so another tab can upgrade the database", async () => {
      const { result } = renderHook(() => useJsonPathHistory());
      await act(async () => {
        await result.current.addToHistory("$.name");
      });

      const upgraded = await new Promise<string>((resolve) => {
        const request = indexedDB.open("webdev.tools", 99);
        request.onsuccess = () => {
          request.result.close();
          resolve("upgraded");
        };
        setTimeout(() => resolve("blocked"), 1000);
      });
      expect(upgraded).toBe("upgraded");
    });
  });
});

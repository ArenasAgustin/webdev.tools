import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { useJsonPathHistory, resetDbPromise } from "./useJsonPathHistory";

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
});

import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS, getItem, removeItem } from "@/services/storage";

export interface JsonPathHistoryItem {
  id: string;
  expression: string;
  timestamp: number;
  frequency: number;
}

interface JsonPathHistoryHook {
  history: JsonPathHistoryItem[];
  addToHistory: (expression: string) => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const HISTORY_KEY = STORAGE_KEYS.JSONPATH_HISTORY;
const MAX_ITEMS = 20;
const DB_NAME = "webdev.tools";
const DB_VERSION = 2;
const STORE_NAME = "jsonPathHistory";

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp");
        store.createIndex("expression", "expression", { unique: true });
      } else {
        const store = request.transaction?.objectStore(STORE_NAME);
        if (store && !store.indexNames.contains("timestamp")) {
          store.createIndex("timestamp", "timestamp");
        }
        if (store && !store.indexNames.contains("expression")) {
          store.createIndex("expression", "expression", { unique: true });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(request.error?.message ?? "IndexedDB error"));
  });

const loadHistoryFromDb = async (): Promise<JsonPathHistoryItem[]> => {
  const db = await openDb();
  const transaction = db.transaction([STORE_NAME], "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("timestamp");
  const items: JsonPathHistoryItem[] = [];

  await new Promise<void>((resolve, reject) => {
    const cursorRequest = index.openCursor(null, "prev");
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor && items.length < MAX_ITEMS) {
        items.push(cursor.value as JsonPathHistoryItem);
        cursor.continue();
      } else {
        resolve();
      }
    };
    cursorRequest.onerror = () =>
      reject(new Error(cursorRequest.error?.message ?? "Cursor request error"));
  });

  return items;
};

const pruneHistory = async () => {
  const db = await openDb();
  const transaction = db.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("timestamp");
  let count = 0;

  await new Promise<void>((resolve, reject) => {
    const cursorRequest = index.openCursor(null, "prev");
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) {
        resolve();
        return;
      }

      count += 1;
      if (count > MAX_ITEMS) {
        cursor.delete();
      }
      cursor.continue();
    };
    cursorRequest.onerror = () =>
      reject(new Error(cursorRequest.error?.message ?? "Cursor request error"));
  });
};

const migrateLocalStorage = async () => {
  const saved = getItem<JsonPathHistoryItem[]>(HISTORY_KEY);
  if (!saved) return;

  try {
    if (!Array.isArray(saved) || saved.length === 0) {
      removeItem(HISTORY_KEY);
      return;
    }

    const db = await openDb();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    saved.forEach((item) => store.put(item));

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(transaction.error?.message ?? "Transaction error"));
      transaction.onabort = () => reject(new Error("Transaction aborted"));
    });

    removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Error migrating JSONPath history:", error);
  }
};

/**
 * Hook to manage JSONPath filter history with localStorage persistence
 */
export function useJsonPathHistory(): JsonPathHistoryHook {
  const [history, setHistory] = useState<JsonPathHistoryItem[]>([]);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      try {
        await migrateLocalStorage();
        const items = await loadHistoryFromDb();
        if (isActive) setHistory(items);
      } catch (error) {
        console.error("Error initializing JSONPath history:", error);
      }
    };

    void initialize().catch((error) => {
      console.error("Failed to initialize history:", error);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const addToHistory = useCallback(async (expression: string) => {
    if (!expression.trim()) return;

    try {
      const db = await openDb();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const expressionIndex = store.index("expression");

      const existing = await new Promise<JsonPathHistoryItem | null>((resolve, reject) => {
        const request = expressionIndex.get(expression);
        request.onsuccess = () => {
          const result = (request.result as JsonPathHistoryItem | undefined) ?? null;
          resolve(result);
        };
        request.onerror = () => reject(new Error(request.error?.message ?? "Request error"));
      });

      if (existing) {
        store.put({
          ...existing,
          frequency: existing.frequency + 1,
          timestamp: Date.now(),
        });
      } else {
        store.add({
          id: Date.now().toString(),
          expression,
          timestamp: Date.now(),
          frequency: 1,
        });
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(new Error(transaction.error?.message ?? "Transaction error"));
        transaction.onabort = () => reject(new Error("Transaction aborted"));
      });

      await pruneHistory();
      const items = await loadHistoryFromDb();
      setHistory(items);
    } catch (error) {
      console.error("Error saving JSONPath history:", error);
    }
  }, []);

  const removeFromHistory = useCallback(async (id: string) => {
    try {
      const db = await openDb();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(new Error(transaction.error?.message ?? "Transaction error"));
        transaction.onabort = () => reject(new Error("Transaction aborted"));
      });

      const items = await loadHistoryFromDb();
      setHistory(items);
    } catch (error) {
      console.error("Error deleting JSONPath history item:", error);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      const db = await openDb();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.clear();

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(new Error(transaction.error?.message ?? "Transaction error"));
        transaction.onabort = () => reject(new Error("Transaction aborted"));
      });

      setHistory([]);
    } catch (error) {
      console.error("Error clearing JSONPath history:", error);
    }
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

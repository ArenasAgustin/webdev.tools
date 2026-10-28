/**
 * SQL Worker — Vite worker entry.
 * Handles format / validate / minify / load / execute / reset messages.
 * sql.js is lazily imported on the first LOAD or EXECUTE only.
 */

import type { SqlWorkerRequest, SqlWorkerResponse } from "@/services/sql/worker.types";
import { ROW_CAP } from "@/services/sql/worker.types";
import { formatSql, validateSql, minifySql } from "@/services/sql/transform";
import { roundElapsedMs, runStatements } from "@/services/sql/execute";
import type { Database } from "sql.js";
import sqlWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

const ctx = self as unknown as {
  postMessage: (message: SqlWorkerResponse) => void;
  onmessage: (event: MessageEvent<SqlWorkerRequest>) => void;
};

// Singleton: lazily initialized on first EXECUTE, reset by RESET action.
let dbPromise: Promise<Database> | null = null;

async function getDb(): Promise<Database> {
  dbPromise ??= (async () => {
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs({ locateFile: () => sqlWasmUrl });
    return new SQL.Database();
  })();
  return dbPromise;
}

ctx.onmessage = (event: MessageEvent<SqlWorkerRequest>) => {
  const req = event.data;

  void (async () => {
    try {
      switch (req.action) {
        case "format": {
          const result = formatSql(req.input, req.options);
          if (result.ok) {
            ctx.postMessage({ id: req.id, ok: true, value: result.value });
          } else {
            ctx.postMessage({ id: req.id, ok: false, error: { message: result.error } });
          }
          return;
        }

        case "validate": {
          const result = validateSql(req.input);
          if (result.ok) {
            ctx.postMessage({ id: req.id, ok: true, value: "" });
          } else {
            ctx.postMessage({ id: req.id, ok: false, error: { message: result.error } });
          }
          return;
        }

        case "minify": {
          const result = minifySql(req.input);
          if (result.ok) {
            ctx.postMessage({ id: req.id, ok: true, value: result.value });
          } else {
            ctx.postMessage({ id: req.id, ok: false, error: { message: result.error } });
          }
          return;
        }

        case "load": {
          await getDb();
          ctx.postMessage({ id: req.id, ok: true, value: "" });
          return;
        }

        case "execute": {
          const db = await getDb();
          const start = performance.now();
          const { resultSets, truncated } = runStatements(db, req.input, ROW_CAP);
          ctx.postMessage({
            id: req.id,
            ok: true,
            action: "execute",
            value: { resultSets, elapsedMs: roundElapsedMs(performance.now() - start), truncated },
          });
          return;
        }

        case "reset": {
          if (dbPromise) {
            try {
              const db = await dbPromise;
              db.close();
            } catch {
              // ignore close errors
            }
          }
          dbPromise = null;
          ctx.postMessage({ id: req.id, ok: true, value: "reset" });
          return;
        }

        default: {
          const { id, action } = req as { id: string; action?: unknown };
          ctx.postMessage({ id, ok: false, error: { message: `Unsupported worker action: ${String(action)}` } });
          return;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Distinguish execute errors from other errors for typed response
      if (req.action === "execute") {
        ctx.postMessage({
          id: req.id,
          ok: false,
          action: "execute",
          error: { message },
        });
      } else {
        ctx.postMessage({ id: req.id, ok: false, error: { message } });
      }
    }
  })();
};

export {};

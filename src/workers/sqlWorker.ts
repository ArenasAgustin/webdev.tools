/**
 * SQL Worker — Vite worker entry.
 * Handles format / validate / minify / execute / reset messages.
 * sql.js is lazily imported on the first EXECUTE only.
 */

import type { SqlWorkerRequest, SqlWorkerResponse } from "@/services/sql/worker.types";
import { ROW_CAP } from "@/services/sql/worker.types";
import { formatSql, validateSql, minifySql } from "@/services/sql/transform";
import type { Database } from "sql.js";

const ctx = self as unknown as {
  postMessage: (message: SqlWorkerResponse) => void;
  onmessage: (event: MessageEvent<SqlWorkerRequest>) => void;
};

// Singleton: lazily initialized on first EXECUTE, reset by RESET action.
let dbPromise: Promise<Database> | null = null;

async function getDb(): Promise<Database> {
  dbPromise ??= (async () => {
    const initSqlJs = (await import("sql.js")).default;
    const SQL = await initSqlJs();
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

        case "execute": {
          const db = await getDb();
          const start = performance.now();
          const stmts = db.exec(req.input);
          const last = stmts[stmts.length - 1] ?? { columns: [], values: [] };
          const truncated = last.values.length > ROW_CAP;
          ctx.postMessage({
            id: req.id,
            ok: true,
            action: "execute",
            value: {
              columns: last.columns,
              rows: last.values.slice(0, ROW_CAP),
              elapsedMs: performance.now() - start,
              truncated,
            },
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

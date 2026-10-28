import type { PlaygroundConfig } from "@/types/playground";

/**
 * File names, mime type and import filter shared by the SQL engine and its actions hook.
 * The result download picks its own name and type from the output (JSON result or SQL).
 */
export const sqlFileSettings = {
  inputFileName: "query.sql",
  outputFileName: "result.json",
  mimeType: "application/sql",
  acceptExtensions: ".sql",
} as const;

export const sqlPlaygroundConfig: PlaygroundConfig = {
  id: "sql",
  name: "SQL tools",
  icon: "fas fa-database",
  description: {
    es: "Formatear, minificar y ejecutar consultas SQL en el navegador",
    en: "Format, minify and run SQL queries in the browser",
  },
  language: "sql",
  keywords: [
    "SQL formatter",
    "SQL beautifier",
    "SQL minifier",
    "online SQL executor",
    "SQLite WASM",
    "SQL playground",
  ],
  example: `-- Crear una tabla de ejemplo
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos
INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('Charlie', 'charlie@example.com');

-- Consultar datos
SELECT
  id,
  name,
  email
FROM
  users
WHERE
  name LIKE 'A%'
ORDER BY
  name ASC;`,
};

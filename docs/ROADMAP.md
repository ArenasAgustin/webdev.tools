# ROADMAP

## Unificación de Arquitectura

### Objetivo

- [x] Unificar la arquitectura de todos los playgrounds para que compartan la misma base técnica. ✅
- [x] Mantener diferencias únicamente en lógica de lenguaje (features específicas). ✅
- [x] Cubrir de forma consistente: hooks, servicios, componentes, workers, funciones y testing. ✅

### Fase 1 — Contrato Arquitectónico Único

- [x] Definir contrato base obligatorio por playground ✅
  - [x] estado principal de input/output/error ✅
  - [x] validación ✅
  - [x] acciones de toolbar ✅
  - [x] persistencia de config + último input ✅
  - [x] atajos de teclado ✅
- [x] Congelar interfaces compartidas en: ✅
  - [x] `src/types/config.ts` ✅
  - [x] `src/types/toolbar.ts` ✅
  - [x] `src/services/transform.ts` ✅
- [x] Documentar especificación de arquitectura (obligatorio vs extensible por lenguaje). ✅

### Fase 2 — Núcleo Compartido

- [x] Estandarizar hooks base ✅
  - [x] lifecycle común ✅
  - [x] acciones comunes ✅
  - [x] transformaciones ✅
  - [x] configuración ✅
  - [x] shortcuts ✅
  - [x] persistencia ✅
- [x] Unificar servicios bajo contratos comunes `format/minify/validate` con adapters por lenguaje. ✅
- [x] Unificar workers con runtime/client factory compartidos y adapters por playground. ✅
- [x] Crear/usar layout base común para playgrounds (editores + toolbar + paneles). ✅

### Fase 3 — Migración Playground por Playground

- [x] Migrar en este orden: CSS → HTML → JS → JSON. ✅
  - [x] CSS ✅
  - [x] HTML ✅
  - [x] JS ✅
  - [x] JSON ✅
- [x] Aplicar plantilla estructural única por playground: ✅
  - [x] CSS (`*.config.ts`, `*Playground.tsx`, `*Playground.branches.test.tsx`, `*Editors.tsx`, `*Editors.test.tsx`, `use*PlaygroundActions.ts`, `services/*/transform.ts`, `services/*/transform.test.ts`, tests unitarios + integración + e2e) ✅
  - [x] HTML (`*.config.ts`, `*Playground.tsx`, `*Playground.branches.test.tsx`, `*Editors.tsx`, `*Editors.test.tsx`, `use*PlaygroundActions.ts`, `services/*/transform.ts`, `services/*/transform.test.ts`, tests unitarios + integración + e2e) ✅
  - [x] JS (`*.config.ts`, `*Playground.tsx`, `*Playground.branches.test.tsx`, `*Editors.tsx`, `*Editors.test.tsx`, `use*PlaygroundActions.ts`, `services/*/transform.ts`, `services/*/transform.test.ts`, tests unitarios + integración + e2e) ✅
  - [x] JSON (`*.config.ts`, `*Playground.tsx`, `*Playground.branches.test.tsx`, `*Editors.tsx`, `*Editors.test.tsx`, `use*PlaygroundActions.ts`, `services/*/transform.ts`, `services/*/transform.test.ts`, tests unitarios + integración + e2e) ✅
- [x] Limitar diferencias a lógica de dominio (ejecución JS, JSONPath, preview HTML, etc.). ✅

### Fase 3.5 — Consolidación de Módulos

- [x] Eliminar `formatter/formatter.ts` — cada `transform.ts` importa `formatter/prettier.ts` directamente. ✅
- [x] Eliminar `minifier/minifier.ts` — minificación inlined en cada `transform.ts` (Terser para JS, JSON.stringify para JSON, CSS propio). ✅
- [x] Consolidar archivos por playground en `transform.ts` único: ✅
  - [x] JS: `format.test.ts` + `minify.test.ts` → `transform.test.ts` ✅
  - [x] JSON: `format.test.ts` + `minify.test.ts` + `clean.ts` + `clean.test.ts` + `parse.ts` + `parse.test.ts` + `utils.ts` + `utils.test.ts` → `transform.ts` + `transform.test.ts` ✅
- [x] Estructura final uniforme por playground: ✅
  - `service.ts` — facade pública
  - `transform.ts` — funciones puras (format, minify, parse, clean, utils)
  - `transform.test.ts` — tests de todas las funciones puras
  - `worker.ts` — orquestación async con fallback
  - `worker.types.ts` — tipos del worker
  - `workerClient.ts` — cliente del worker

### Fase 4 — Matriz de Testing Unificada

- [x] Definir mínimo obligatorio por playground: ✅
  - [x] Unit: services + hooks ✅
  - [x] Integración: playground + toolbar/config + branches (`*Playground.branches.test.tsx`) + editores (`*Editors.test.tsx`) ✅
  - [x] E2E: workflow feliz + persistencia de configuración ✅
- [x] Homologar estructura de tests en: ✅
  - [x] `src/playgrounds/*` ✅
  - [x] `src/hooks/*` ✅
  - [x] `e2e/*` ✅
- [x] Agregar checklist en CI para evitar desvíos de arquitectura. ✅
- [x] Completar gaps de testing: ✅
  - [x] `src/playgrounds/json/JsonPlayground.test.tsx` (faltaba test principal del componente) ✅
  - [x] `src/services/css/worker.test.ts` + `workerClient.test.ts` (faltaban tests de worker para CSS) ✅
  - [x] `src/services/html/worker.test.ts` + `workerClient.test.ts` (faltaban tests de worker para HTML) ✅
- [x] Documentar matriz de testing (`docs/TESTING_MATRIX.md`) ✅
- [x] Script de verificación arquitectónica (`scripts/verify-architecture.js`, `pnpm verify:arch`) ✅

### Fase 5 — Gobernanza y Prevención de Deriva

- [x] Crear guía de contribución para nuevos playgrounds (`docs/CONTRIBUTING_PLAYGROUND.md`). ✅
- [x] Definir plantilla oficial para alta de playgrounds (incluida en la guía con checklist paso a paso). ✅
- [x] Agregar reglas lint/estructura para detectar módulos incompletos. ✅
  - [x] Validación de naming conventions (config export, config id, component export) ✅
  - [x] Validación de registro en `src/playgrounds/registry.ts` ✅
  - [x] Integrado en `pnpm verify:arch` ✅
- [x] Crear script de verificación arquitectónica: ✅
  - [x] naming ✅
  - [x] archivos requeridos ✅
  - [x] cobertura mínima de tests ✅

### Criterios de Aceptación

- [x] Todos los playgrounds comparten el mismo esqueleto técnico. ✅
- [x] Hooks y servicios principales implementan contratos comunes. ✅
- [x] La matriz de tests es consistente entre playgrounds. ✅
- [x] Las diferencias se limitan a lógica de lenguaje. ✅

### Fase 6 — Homogenización Cross-Playground

- [x] Consolidar `JsInputActions`/`JsonInputActions`/`JsOutputActions`/`JsonOutputActions` en componentes unificados `InputActions`/`OutputActions` ✅
- [x] Renombrar tipos JSON con prefijo (`FormatConfig` → `JsonFormatConfig`, `MinifyConfig` → `JsonMinifyConfig`, `CleanConfig` → `JsonCleanConfig`, `ToolsConfig` → `JsonToolsConfig`) ✅
- [x] Renombrar constantes JSON con prefijo (`DEFAULT_FORMAT_CONFIG` → `DEFAULT_JSON_FORMAT_CONFIG`, etc.) ✅
- [x] Unificar estado inicial de JSON con fallback a ejemplo (`loadLastJson() || jsonPlaygroundConfig.example`) ✅
- [x] Agregar preloading de servicios a CSS y HTML (`useEffect` con imports dinámicos) ✅
- [x] Unificar footer del panel de entrada: CSS/HTML ahora usan `ValidationStatus` con `withWrapper`/`withFlex`/`validExtra` (como JS/JSON) ✅
- [x] Renombrar props de `JsonEditors` (`inputValue` → `inputJson`, `outputValue` → `outputJson`) ✅
- [x] Unificar títulos de paneles con nombres de lenguaje (JS: "Código" → "JavaScript", JSON: "Entrada" → "JSON") ✅
- [x] Unificar íconos de paneles (JSON: "edit" → "code") ✅

### Fase 6.2 — Homogenización Cross-Playground (segunda pasada)

**Fixes fáciles (bajo riesgo):**

- [x] Unificar orden de imports de React hooks (`useState, useEffect, useMemo`) en todos los Playgrounds ✅
- [x] Renombrar props de `JsonEditors` (`outputJson` → `output`, `outputError` → `error`) para coincidir con CSS/HTML/JS ✅
- [x] Agregar labels a `ValidationStatus` en JSON (`waitingLabel`, `validLabel`, `invalidLabel`) ✅
- [x] Agregar `className` de truncado a `OutputStatus` en JS y JSON (como CSS/HTML) ✅
- [x] Renombrar `indent` → `indentSize` en `JsonFormatConfig` y toda la cadena (types, transform, hooks, ConfigModal, tests) ✅
- [x] Renombrar storage genérico JSON: `loadToolsConfig` → `loadJsonToolsConfig`, `saveToolsConfig` → `saveJsonToolsConfig`, `removeToolsConfig` → `removeJsonToolsConfig`, `TOOLS_CONFIG` → `JSON_TOOLS_CONFIG` ✅

**Pendientes (requieren refactor mayor — futura fase):**

- [ ] Unificar output state pattern de JSON (computed vs `useState` directo)
- [ ] Unificar Toolbar configuration pattern de JSON (3 memos + variant `"json"` vs `"generic"`)
- [ ] Unificar actions hook pattern de JSON (callback injection vs direct params)
- [ ] Unificar error handling de JSON (`compactTransformError`)
- [ ] Mover types locales de JS/JSON (`*.types.ts`) a types globales
- [ ] Renombrar `inputCode` → `inputJs` en JS playground

## New Playground Implementations

- [ ] **SQL Playground** (5-7 días)
  - [ ] **Stack/Plugins:** `sql-formatter` (format), `node-sql-parser` (validate/AST), `sql.js` (execution in-browser)
  - [ ] Integrar SQL formatter/parser (sql-formatter)
  - [ ] Implement: `services/sql/parse.ts`, `format.ts`, `validate.ts`
  - [ ] Query execution (SQLite in-browser con sql.js)
  - [ ] Crear `useSqlPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/sql/SqlPlayground.tsx`
  - [ ] Tab para results/schema visualization
  - [ ] Tests unitarios (services + hooks)
  - [ ] Tests de integración (playground + toolbar/config)
  - [ ] E2E workflow SQL (format/validate/execute/resultados)

- [ ] **PHP Playground** (6-8 días)
  - [ ] **Stack/Plugins:** `php-parser` (AST/validate), `prettier-plugin-php` (format), Vercel Functions (ejecución sandbox)
  - [ ] Integrar PHP parser/formatter
  - [ ] Implement: `services/php/parse.ts`, `format.ts`, `validate.ts`
  - [ ] Backend execution en serverless (Vercel Functions)
  - [ ] Crear `usePhpPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/php/PhpPlayground.tsx`
  - [ ] Highlight syntax errors
  - [ ] Output capture (sin ejecución en-browser, call API)
  - [ ] Tests unitarios (services + adapters)
  - [ ] Tests de integración (playground + API client)
  - [ ] E2E workflow PHP (format/validate/execute API)

## Nuevas features por implementar

- [ ] Transformación de JSON a TOON, CSV, XML, YAML
- [ ] Color transform
- [ ] Unix timestamp transform
- [ ] Convertidor de unidades de CSS
- [ ] Generador de QR codes
- [ ] Playground de Markdown con preview
- [ ] Regex tester con visualización de grupos
- [ ] Playground Typescript
- [ ] Playground de SASS/SCSS/LESS

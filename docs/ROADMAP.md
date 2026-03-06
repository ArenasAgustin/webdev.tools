# ROADMAP

## Unificación de Arquitectura

### Objetivo

- [ ] Unificar la arquitectura de todos los playgrounds para que compartan la misma base técnica.
- [ ] Mantener diferencias únicamente en lógica de lenguaje (features específicas).
- [ ] Cubrir de forma consistente: hooks, servicios, componentes, workers, funciones y testing.

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

- [ ] Migrar en este orden: CSS → HTML → JS → JSON.
- [ ] Aplicar plantilla estructural única por playground:
  - [ ] `*.config.ts`
  - [ ] `*Playground.tsx`
  - [ ] `*Editors.tsx`
  - [ ] `use*PlaygroundActions.ts`
  - [ ] `services/*/transform.ts`
  - [ ] tests unitarios + integración + e2e
- [ ] Limitar diferencias a lógica de dominio (ejecución JS, JSONPath, preview HTML, etc.).

### Fase 4 — Matriz de Testing Unificada

- [ ] Definir mínimo obligatorio por playground:
  - [ ] Unit: services + hooks
  - [ ] Integración: playground + toolbar/config
  - [ ] E2E: workflow feliz + persistencia de configuración
- [ ] Homologar estructura de tests en:
  - [ ] `src/playgrounds/*`
  - [ ] `src/hooks/*`
  - [ ] `e2e/*`
- [ ] Agregar checklist en CI para evitar desvíos de arquitectura.

### Fase 5 — Gobernanza y Prevención de Deriva

- [ ] Crear guía de contribución para nuevos playgrounds.
- [ ] Definir plantilla oficial para alta de playgrounds.
- [ ] Agregar reglas lint/estructura para detectar módulos incompletos.
- [ ] Crear script de verificación arquitectónica:
  - [ ] naming
  - [ ] archivos requeridos
  - [ ] cobertura mínima de tests

### Criterios de Aceptación

- [ ] Todos los playgrounds comparten el mismo esqueleto técnico.
- [ ] Hooks y servicios principales implementan contratos comunes.
- [ ] La matriz de tests es consistente entre playgrounds.
- [ ] Las diferencias se limitan a lógica de lenguaje.

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

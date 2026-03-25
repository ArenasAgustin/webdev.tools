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

**Refactors estructurales:**

- [x] Unificar output state pattern de JSON (computed vs `useState` directo) ✅
- [x] Unificar Toolbar configuration pattern de JSON (3 memos + variant `"json"` vs `"generic"`) ✅
- [x] Unificar actions hook pattern de JSON (callback injection vs direct params) ✅
- [x] Unificar error handling de JSON (`compactTransformError`) ✅
- [x] Mover types locales de JS/JSON (`*.types.ts`) a types globales ✅
- [x] Renombrar `inputCode` → `inputJs` en JS playground ✅

### Fase 7 — Generalización de Componentes Cross-Playground

Eliminación de código duplicado entre los 4 playgrounds mediante factories, hooks y componentes genéricos.

**Features que NO se generalizan** (extensiones playground-specific vía props/slots):

| Feature único                                  | Playground |
| ---------------------------------------------- | ---------- |
| `handleExecute` + detección de loops infinitos | JS         |
| Preview HTML + `inspectDom`                    | HTML       |
| JSONPath + history + tips modals               | JSON       |
| `handleClean` (3er config)                     | JSON       |

**Fase 7.1 — Factory para format/minify handlers (~240 líneas, riesgo bajo):**

- [x] Crear factory `createTransformHandler` en `utils/` que reciba: service fn, input, config, setOutput, setError, mensajes ✅
- [x] Refactorizar `handleFormat` y `handleMinify` en los 4 actions hooks para usar la factory ✅
- [x] Eliminar código duplicado de `onSuccess`/`onError`/`autoCopy` pattern ✅

**Fase 7.2 — Componentes `InputFooter` / `OutputFooter` (~120 líneas, riesgo bajo):**

- [x] Crear `<InputFooter>` que encapsule `ValidationStatus` + `Stats` (input) ✅
- [x] Crear `<OutputFooter>` que encapsule `OutputStatus` + `Stats` (output) ✅
- [x] Reemplazar las 16 instancias repetidas en los 4 `*Editors.tsx` (panel normal + modal expandido) ✅

**Fase 7.3 — `GenericEditors` component (~800 líneas, riesgo medio):**

- [x] Crear `<GenericEditors>` que encapsule: `useExpandedEditor` + `useTextStats` × 2 + grid de 2 Panels + 2 ExpandedEditorModals ✅
- [x] Parametrizar por: `language`, labels, placeholders, validation state ✅
- [x] Soportar extensiones vía slots: `extraOutputActions` (HTML preview), `extraContent` ✅
- [x] Reemplazar los 4 `*Editors.tsx` por instancias configuradas de `GenericEditors` ✅

**Fase 7.4 — Hook `useToolbarConfig` (~120 líneas, riesgo bajo):**

- [x] Crear hook `useToolbarConfig(mode, configs, modal)` que retorne `toolbarTools` + `toolbarConfig` memoizados ✅
- [x] Soportar acciones extra vía parámetro (execute en JS, clean en JSON) ✅
- [x] Reemplazar los 4 bloques `useMemo<ToolbarConfig>` + `useMemo(toolbarConfig)` en los playgrounds ✅

## Refactorización y Optimización

### Fase 8 — Generalización de Hooks Cross-Playground

Eliminación de código duplicado en hooks y consolidación de patrones comunes.

**Fase 8.1 — Hook genérico `usePlaygroundSetup` (~400 líneas eliminadas, riesgo alto):**

- [x] Crear hook `usePlaygroundSetup<TFormat, TMinify>(playgroundConfig)` que encapsule la inicialización común de los 4 playgrounds:
  - `loadXToolsConfig()` + `useMergedConfigState` para format/minify
  - `useState` para input/output/error
  - `useModalState` para configModal
  - `useToast` + `usePlaygroundInputLifecycle`
- [x] Crear hook `usePlaygroundToolbar` que encapsule `usePlaygroundShortcuts` + `useToolbarConfig` con overloads para clean/no-clean
- [x] Reducir `CssPlayground.tsx`, `HtmlPlayground.tsx`, `JsPlayground.tsx` a wrappers compactos usando `usePlaygroundSetup` + `usePlaygroundToolbar`
- [x] `JsonPlayground.tsx` mantiene extensiones propias (JSONPath, clean, history) pero usa el hook base
- [x] Tests: los 4 `*Playground.branches.test.tsx` pasan sin cambios (mocks a nivel de módulo)

**Fase 8.2 — Hook genérico de validación `useAsyncValidator` (~120 líneas eliminadas, riesgo medio):**

- [x] Crear `useAsyncValidator<T>(input, validateFn, errorFormatter)` que encapsule el patrón común de `useCssParser` y `useHtmlParser`
  - `useEffect` con cancelled flag + async validation + error compacting
  - Interfaz genérica `ValidationState { isValid: boolean; error: { message: string } | null }`
- [x] Refactorizar `useCssParser.ts` y `useHtmlParser.ts` para usar el hook genérico
- [x] Consolidar `compactCssError()` y `compactHtmlError()` en `compactTransformError()` (ya existente en `utils/transformError.ts`)
- [x] Refactorizar también `useJsParser.ts` y `useJsonParser.ts` para usar `useAsyncValidator` (wrappers con `Promise.resolve`)
- [x] Tests: `useHtmlParser.test.ts` pasa sin cambios; `useJsonParser.test.ts` actualizado a async (`waitFor`)

**Fase 8.3 — Factory para playground actions `useGenericPlaygroundActions` (~500 líneas eliminadas, riesgo alto):**

- [x] Crear hook base `useGenericPlaygroundActions<TFormat, TMinify>(config)` que encapsule:
  - `handleCopyOutput` con toast
  - `handleDownloadInput` / `handleDownloadOutput`
  - `handleFormat` / `handleMinify` vía `createTransformHandler`
  - `handleClearInput`
  - `handleLoadExample`
- [x] Parametrizar por: service, nombres de operación, configuraciones, extensiones de archivo
- [x] Refactorizar `useCssPlaygroundActions.ts` (129 LOC) y `useHtmlPlaygroundActions.ts` (135 LOC) a configuraciones mínimas
- [x] `useJsPlaygroundActions.ts` (342 LOC) y `useJsonPlaygroundActions.ts` (253 LOC) extienden el hook base con operaciones propias (execute, clean, JSONPath)
- [x] Tests: actualizar los 4 `*PlaygroundActions.test.ts` y agregar test dedicado para el hook base

### Fase 9 — Generalización de Services y Workers

**Fase 9.1 — Factory para worker clients `createWorkerClient` (~70 líneas eliminadas, riesgo bajo):**

- [x] Crear factory `createWorkerClient` que encapsule el patrón idéntico de los 4 `workerClient.ts` — implementado en `src/services/worker/clientFactory.ts` (worker persistente con mapa de pending) y `src/services/worker/adapter.ts` (`createPlaygroundWorkerAdapter`) ✅
- [x] Crear `createWorkerAdapter<TPayload, TResponse>` — wrapper simplificado de 2 type params que elimina la necesidad de exponer `TRequest` en los `workerClient.ts` ✅
- [x] Refactorizar los 4 `workerClient.ts` a 7 líneas usando `createWorkerAdapter` (sin `buildRequest`, sin `unavailableMessage`, sin import de `XWorkerRequest`) ✅
- [x] Tests: reutilizar tests existentes, agregar test del factory (`adapter.test.ts`) ✅

**Fase 9.2 — Tipos genéricos de worker (~40 líneas eliminadas, riesgo bajo):**

- [x] Crear tipos genéricos `WorkerPayloadBase`, `WorkerRequest<TPayload>` y `WorkerResponse<TError>` en `src/services/worker/types.ts` ✅
- [x] Refactorizar los 4 `worker.types.ts` para usar los tipos genéricos como base (cada uno define su payload específico y alias `WorkerRequest<payload>` / `WorkerResponse<error>`) ✅
- [x] Verificar que los 4 `worker.ts` y `worker.test.ts` siguen pasando ✅

**Fase 9.3 — Factory para services `createPlaygroundService` (~50 líneas eliminadas, riesgo bajo):**

- [x] Definir interfaz `PlaygroundTransformService<TFormat, TMinify, TError>` en `src/services/transform.ts` con contrato `format/minify/validate` ✅
- [x] Crear helper `createNonEmptyValidator` para validación compartida ✅
- [x] Crear factory `createPlaygroundService<TFormat, TMinify>` en `src/services/transform.ts` — elimina el boilerplate `result.ok ? result : { ok: false, error: result.error.message }` repetido en los 4 services ✅
- [x] Refactorizar los 4 `service.ts` para usar el factory (CSS: 14 LOC, JS: 9 LOC, HTML: 29 LOC, JSON: 20 LOC) ✅
- [x] Tests: 381 tests pasando sin cambios ✅

### Fase 10 — Eliminación de Editores Wrapper Redundantes ✅

**Fase 10.1 — Eliminar alias `*Editors.tsx` innecesarios (~270 líneas eliminadas, riesgo bajo):** ✅

- [x] `CssEditors.tsx` (36 LOC), `JsEditors.tsx` (36 LOC), `JsonEditors.tsx` (32 LOC) eliminados — eran wrappers triviales que solo pasaban props a `GenericEditors` ✅
- [x] `HtmlEditors.tsx` (169 LOC) eliminado — lógica de preview/inspectDom movida a `HtmlPlayground.tsx` ✅
- [x] Los 4 playgrounds usan `GenericEditors` directamente ✅
- [x] Imports y mocks actualizados en todos los `*.branches.test.tsx` y `*Editors.test.tsx` ✅
- [x] Test de preview toggle añadido a `HtmlPlayground.test.tsx` ✅

### Fase 11 — Refactoring de ConfigModal

**Fase 11.1 — Eliminar `@ts-expect-error` en ConfigModal (~riesgo medio):** ✅

- [x] Eliminados los 2 `@ts-expect-error` en `updateFormat` / `updateMinify` ✅
- [x] Solución: dispatch por `props.mode` dentro de cada helper → cada rama llama al setter con el tipo exacto (`as JsFormatConfig`, `as HtmlFormatConfig`, etc.) ✅
- [x] API pública intacta (mismo contrato de props desde PlaygroundLayout) ✅

### Fase 12 — Calidad y Robustez

**Fase 12.1 — Error Boundaries (~riesgo medio):** ✅

- [x] Crear componente `ErrorBoundary` con fallback UI amigable (reintentar + link a inicio) ✅
- [x] Envolver `<PlaygroundComponent>` en `PlaygroundPage.tsx` para aislar crashes por playground ✅
- [x] Agregar `ErrorBoundary` global en `App.tsx` como safety net ✅
- [x] Tests: 5 casos cubriendo render normal, fallback, nombre, reset y logging ✅

**Fase 12.2 — Accesibilidad (`aria-live` en toasts, foco en modales) (~riesgo bajo):** ✅

- [x] `ToastContainer`: `role="status"`, `aria-live="polite"`, `aria-label="Notificaciones"` ✅
- [x] `Modal.tsx`: captura `document.activeElement` al abrir y restaura foco al cerrar (cleanup del `useEffect`) ✅
- [ ] Contraste WCAG AA en textos con opacidad baja — verificación visual manual pendiente
- [x] `PlaygroundSidebar`: `<aside aria-label="Panel de navegación" aria-hidden={!isOpen}>` + `<nav aria-label="Playgrounds disponibles">` ✅

**Fase 12.3 — Consolidación de utilidades de error (~riesgo bajo):** ✅

- [x] `compactCssError()` y `compactHtmlError()` ya eliminadas en Fase 8.2 ✅
- [x] `compactTransformError()` en `utils/transformError.ts` es la única función — usada por `useAsyncValidator`, `createTransformHandler` y `useJsonPlaygroundActions` ✅
- [x] Sin funciones locales duplicadas en los hooks ✅

**Fase 12.4 — Tests compartidos y cobertura (~riesgo medio):** ✅

- [x] Crear utilidades de test compartidas para mocks comunes (`src/test-utils/editorMocks.ts`) ✅
- [x] Agregar tests para componentes sin cobertura: `PlaygroundLoader`, `PlaygroundLayout`, `Panel` ✅
- [x] Agregar tests para `LazyCodeEditor` y `ExpandedEditorModal` (Suspense boundaries) ✅
- [x] Parametrizar `GenericEditors.test.tsx` con `describe.each` para los 4 lenguajes ✅

### Fase 13 — Optimización de Performance y Bundle

**Fase 13.1 — Preloading inteligente (~riesgo bajo):** ✅

- [x] Extraer `useIdleCallback(fn, opts)` hook — elimina la duplicación de `requestIdleCallback` + fallback `setTimeout` entre `Home.tsx` y `PlaygroundPage.tsx` ✅
- [x] Preloading de workers específico por playground — cada `preload()` ahora incluye `import("@/services/*/workerClient")` del playground actual ✅
- [x] Consolidar el patrón de preload vía `useIdleCallback` en `usePlaygroundSetup` — el preload de servicios se ejecuta durante idle time en lugar de inmediatamente ✅

**Fase 13.2 — Loading states en operaciones (~riesgo medio):** ✅

- [x] Agregar estado `isProcessing` a las acciones de format/minify/execute ✅
- [x] Deshabilitar botones de toolbar mientras una operación está en progreso ✅
- [x] Mostrar indicador visual de progreso en el panel de output ✅

**Fase 13.3 — Build y configuración (~riesgo bajo):** ✅

- [x] Agregar `autoprefixer` a `postcss.config.js` para compatibilidad cross-browser ✅ (ya estaba)
- [x] Crear script `pnpm analyze` para visualización de bundle size (ya tiene `rollup-plugin-visualizer`) ✅
- [x] Verificar que `strictNullChecks` está habilitado en `tsconfig.app.json` ✅ (cubierto por `"strict": true`)

### Fase 14 — UX y Funcionalidades Transversales

**Fase 14.1 — Modal de atajos de teclado (~riesgo bajo):** ✅

- [x] Crear modal que muestre todos los atajos de teclado disponibles ✅
- [x] Activar con `?` o `Ctrl+/` ✅ (tecla `?` implementada)
- [x] Listar atajos por playground + atajos globales ✅ (sección Clean solo en JSON)

**Fase 14.2 — Transiciones entre páginas (~riesgo bajo):** ✅

- [x] Agregar transiciones suaves al navegar entre playgrounds (View Transitions API) ✅
- [x] Fade-in del contenido del playground al cargar ✅

**Fase 14.3 — Vista diff input/output (~riesgo alto):**

- [x] Agregar toggle para ver diferencias entre input y output (formato vs minificado) ✅
- [x] Evaluar Monaco diff editor o librería ligera ✅

**Fase 14.4 — SEO avanzado (~riesgo bajo):**

- [x] Agregar JSON-LD structured data (schema `SoftwareApplication`) por playground ✅
- [x] Agregar `og:image` dinámico por playground en `useDocumentMeta` ✅
- [x] Verificar canonical URLs consistentes en todas las rutas ✅

### Fase 15 — Design System y CSS

**Fase 15.1 — Tema centralizado en Tailwind (~riesgo bajo):**

- [x] Extraer colores, spacing y animaciones recurrentes al `tailwind.config.js` (`theme.extend`)
- [x] Mover animación `fadeIn` y estilos de scrollbar de `index.css` a plugins de Tailwind
- [x] Unificar variantes de color en `Button`, `Checkbox`, `RadioGroup` vía configuración de tema

**Fase 15.2 — Composición de clases CSS (~riesgo bajo):**

- [x] Evaluar adopción de `clsx` o `tailwind-merge` para composición segura de clases
- [x] Reemplazar concatenaciones manuales de `className` con template literals

### Fase 16 — PWA y Soporte Offline

**Fase 16.1 — Progressive Web App (~riesgo medio):**

- [ ] Crear `manifest.json` en `public/` con nombre, iconos, tema, start_url
- [ ] Integrar `vite-plugin-pwa` para generación automática de service worker
- [ ] Configurar estrategia de cache (app shell + lazy chunks + workers)
- [ ] Agregar fallback offline UI cuando no hay conexión
- [ ] Agregar botón "Instalar app" con prompt de instalación PWA
- [ ] Tests: verificar que la app funciona sin conexión (formato/minificación local)

### Fase 17 — CI/CD Completo

**Fase 17.1 — Ampliar pipeline de GitHub Actions (~riesgo bajo):**

- [ ] Agregar step de `pnpm lint` al workflow de CI
- [ ] Agregar step de `pnpm test` (unit + integración) al workflow de CI
- [ ] Agregar step de `pnpm verify:arch` al workflow de CI
- [ ] Agregar step de type check (`tsc --noEmit`) explícito
- [ ] Agregar reporte de cobertura (threshold mínimo configurable)
- [ ] Agregar análisis de bundle size como comentario automático en PRs

### Fase 18 — Importación de Archivos y Drag & Drop

**Fase 18.1 — Importar archivos desde disco (~riesgo bajo):**

- [ ] Agregar botón "Abrir archivo" en `InputActions` con `<input type="file" accept=".json,.js,.html,.css">`
- [ ] Leer contenido con `FileReader.readAsText()` y cargar en el editor
- [ ] Soportar drag & drop de archivos sobre el panel de input (`onDragOver` + `onDrop`)
- [ ] Validar tipo de archivo vs playground actual
- [ ] Tests: verificar carga de archivo y drag & drop en e2e

### Fase 19 — Internacionalización (i18n)

**Fase 19.1 — Infraestructura de traducciones (~riesgo alto):**

- [ ] Integrar `react-i18next` + `i18next` como framework de i18n
- [ ] Extraer todos los strings hardcodeados (español) a archivos de traducción (`locales/es.json`)
- [ ] Crear traducción base al inglés (`locales/en.json`)
- [ ] Agregar selector de idioma en sidebar o header
- [ ] Persistir idioma en localStorage
- [ ] Detectar idioma del navegador como default
- [ ] Actualizar `og:locale` dinámicamente en `useDocumentMeta`

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

---

## Nuevas features por implementar

- [ ] Agregar limpiar vacios a JS (variables, funciones, objetos vacíos), html (etiquetas vacías) y css (reglas vacías)
- [ ] Transformación de JSON a TOON, CSV, XML, YAML
- [ ] Color transform
- [ ] Unix timestamp transform
- [ ] Convertidor de unidades de CSS
- [ ] Generador de QR codes
- [ ] Playground de Markdown con preview
- [ ] Regex tester con visualización de grupos
- [ ] Playground Typescript
- [ ] Playground de SASS/SCSS/LESS

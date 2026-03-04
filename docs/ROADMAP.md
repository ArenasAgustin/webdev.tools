# ROADMAP

## 1 ✅

- Agregar funcionalidad al botón de Ejemplo ✅
- Agregar funcionalidad al botón de Copiar ✅
- Agregar funcionalidad al botón de Limpiar vacios ✅
- Agregar funcionalidad al botón de Agrandar ✅

## 2 ✅

- Corregir estilos ✅

## 3 ✅

- Agregar modal con ejemplos para filtros de JSONPath ✅
- Agregar modal para configurar herramientas ✅
- Persistir preferencias y último JSON en localStorage (y preparar IndexedDB para historial) ✅
- Agregar atajos de teclado básicos (formatear, copiar, limpiar) ✅
- Añadir validación en vivo con contador de líneas/caracteres en el output ✅

## 4 ✅

- Historial de filtros JSONPath con acciones rápidas de reutilizar/borrar ✅

### 4.1 - Refactorizaciones Pendientes ✅

#### 🔴 Alta Prioridad — Performance & Rendering

- [x] **Duplicación de iconColors**: Crear constante compartida en `utils/constants/` para `iconColors` usado en `Panel.tsx` y `ExpandedEditorModal.tsx` ✅
- [x] **Tipos de configuración dispersos**: Centralizar interfaces de configuración (`formatConfig`, `minifyConfig`, `cleanConfig`) en `types/json.ts` ✅
- [x] **Servicios de localStorage**: Crear `services/storage.ts` con funciones genéricas de persistencia (`loadSavedConfig`, `loadLastJson`, etc.) ✅

#### 🟠 Media Prioridad — Code Organization

- [x] **Panel y ExpandedEditorModal similares**: Crear componente base `Container` o refactorizar para reutilizar lógica compartida ✅
- [x] **Validación de estado duplicada**: Crear componente `ValidationStatus` o hook `useValidationMessage` para estados del JSON ✅
- [x] **Manejo de colores inconsistente**: Centralizar paleta de colores (hex vs Tailwind) en archivo de constantes ✅
- [x] **Props excesivas en Toolbar**: Agrupar 21 props en objetos (`toolbarActions`, `toolbarConfig`) ✅

#### 🟡 Baja Prioridad

- [x] **Componente de card para configuraciones/tips**: Crear componente `Card` reutilizable para modales ✅
- [x] **Estado modal unificado**: Usar `type ModalType = 'tips' | 'history' | 'config' | null` en lugar de 3 `useState` separados ✅
- [x] **Handlers inline**: Crear hook `useJsonPlaygroundActions()` para encapsular handlers del playground ✅
- [x] **Abstracción de editor expandido**: Crear hook `useExpandedEditor()` para manejo de estado de expansión ✅
- [x] **Carpeta store/ vacía**: Eliminada - no se necesita Zustand para este proyecto ✅

### 4.2 - Refactorizaciones Adicionales ✅

#### 🔴 Alta Prioridad (Adicional)

- [x] **colorMap duplicado en TipsModal**: Mover objeto `colorMap` fuera del componente/map para evitar recreación en cada render ✅
- [x] **App.css sin usar**: Eliminado - estilos no utilizados del boilerplate de Vite ✅

#### 🟠 Media Prioridad (Adicional)

- [x] **Botones de toggle duplicados**: Crear componente `ToggleButtonGroup` para botones de espaciado en ConfigModal ✅
- [x] **Checkboxes con estilos duplicados**: Crear componente `Checkbox` reutilizable (~10 checkboxes en ConfigModal) ✅
- [x] **Wrapper footer repetido**: Crear componente `EditorFooter` para unificar wrappers en JsonEditors ✅

#### 🟡 Baja Prioridad (Adicional)

- [x] **Stats components similares**: Evaluar unificación de `TextStats` y `OutputStats` ✅
- [x] **Radio buttons en ConfigModal**: Crear componente `RadioGroup` reutilizable ✅

## 5 ✅

- Mejorar layout responsive (stack en mobile/tablet, contenedores `min-w-0`, toolbars adhesivas) ✅
- Lazy load de Monaco y split de bundle por playground ✅
- Tests unitarios para servicios (`parse`, `format`, `minify`, `clean`, `jsonPath`) y hooks clave ✅

## 6 ✅

- Generalizar playground ✅
- Tests para playground de js ✅
- Modal de configuracion para playground de js ✅
- Hacer que el toolbar de js use el componente de toolbar generalizado ✅
- Agregar boton para descargar JSON y js ✅

## 7 ✅

- Mejoras UX/UI: toolbars flotantes dentro del editor ✅
- Ajustes mobile/tablet: alturas consistentes, scroll suave y barras adhesivas ✅

## 8 ✅

- Rendimiento: debounce en validaciones/operaciones, límite de tamaño de entrada con avisos ✅
- Mover parseo pesado a Web Worker (cuando aplique) ✅
- Memoización de resultados y virtualización en vistas grandes ✅

## 9

- SEO/Accesibilidad: meta tags, OpenGraph/Twitter cards, títulos únicos por vista ✅
- Atributos `lang`/`dir`, roles ARIA, foco visible y traps en modales ✅
- Verificación de contraste y navegación por teclado completa ✅

## 10

- Calidad de código: ESLint type‑checked + reglas React, Prettier y husky ✅
- Tests unitarios y de integración con Vitest para servicios y hooks ✅
- Storybook rápido para componentes comunes ✅

## 11

### Storybook Enhancements

- [x] **Stories básicas**: Button, Checkbox, RadioGroup, Card, Modal, ToggleButtonGroup ✅
- [x] **Stories para componentes complejos**: ConfigModal (JSON/JS), JsonPathHistoryModal, TipsModal, Toolbar ✅
- [x] **Documentación en MDX**: Explicar props, casos de uso y patrones de cada componente ✅
- [x] **Decorators globales**: Provider de temas, context API, layouts compartidos ✅
- [x] **Stories avanzadas**: Estados de error, loading, interacciones, variantes edge-case ✅
  - Button: Loading, WithIcon, LongText, AllVariants, AllSizes
  - JsonPathHistoryModal: VeryLongExpressions, HighFrequency, OldTimestamps, ScrollableList
  - Toolbar: JsonWithLongPath, JsonEmptyHistory, GenericManyActions, GenericWithLongLabels
  - ConfigModal: InteractionToggleCheckbox, InteractionChangeIndent, InteractionCloseModal, EdgeCaseAllOptionsEnabled/Disabled
  - Card: VeryLongTitle, MinimalContent, ComplexContent, VeryLongScrollableContent, MultipleCards
  - Modal: VeryLongTitle, ScrollableContent, WithComplexFooter, WithFormContent, LoadingState, SuccessState

## 12 - Refactoring & Performance Optimization

### 12.1 - Performance & Rendering (Phase 1 - 1-2 días)

#### 🔴 Alta Prioridad

- [x] **Memoizar componentes complejos**: `JsonEditors`, `JsEditors`, `CodeEditor` ✅
  - **Impacto:** 10-15% mejora responsividad con JSON >1MB
  - **Implementado:** React.memo aplicado a JsonEditors, JsEditors y CodeEditor
  - **Resultado:** Previene re-renders innecesarios cuando props no cambian
- [x] **useMemo & useCallback en playgrounds**: Evitar recreación de handlers y objetos ✅
  - **Impacto:** Prevenir re-renders innecesarios en Toolbar
  - **Implementado:** useMemo aplicado a objetos complejos de Toolbar en ambos playgrounds
  - **Resultado:** Toolbar ya no re-renderiza cuando props memoizadas no cambian
- [x] **Lazy Load Monaco Editor**: Reducir bundle inicial ✅
  - **Impacto:** -25% tamaño bundle principal (244KB → 182KB vendor)
  - **Status:** Completado con code splitting optimizado
  - **Implementado:** manualChunks en vite.config.ts separando Monaco (21KB), React Router (40KB) y vendor (182KB)
  - **Resultado:** Monaco carga solo cuando se abre un editor por primera vez

- [x] **Optimizar imports**: Mejorar tree-shaking ✅
  - **Impacto:** -55% en JsonPlayground (45.7KB → 20.6KB)
  - **Implementado:**
    - Removida dependencia no usada: zustand (5.0.9)
    - Optimizados exports en index.ts (solo exports públicos, no componentes internos)
    - Separado jsonpath-plus en chunk independiente (25KB) - carga solo con JSON playground
  - **Resultado:** JsonPlayground más ligero, mejor cache y lazy loading de dependencias pesadas

### 12.2 - Code Organization (Phase 2 - 3-5 días)

#### 🟠 Media Prioridad

- [x] **Unificar servicios JSON/JS**: Crear utilidades compartidas y reducir duplicación ✅
  - **Impacto:** Código más mantenible, -280 bytes bundle
  - **Implementado:**
    - Creado `services/json/utils.ts` con `sortJsonKeys` y `JSON_ERROR_MESSAGES`
- Refactorizados format.ts, minify.ts, clean.ts, jsonPath.ts para usar utilidades compartidas
  - Eliminada duplicación de sortJsonKeys (antes definida 2 veces)
  - Tests completos: 7 tests nuevos + 45 existentes pasando
  - **Resultado:** jsonWorker 28.26KB → 28.12KB, JsonPlayground 20.61KB → 20.47KB

- [x] **Extraer lógica de modales a hooks**: `useModalState` ✅
  - **Impacto:** Mejor testabilidad, código más mantenible, API consistente
  - **Implementado:**
    - Creado `hooks/useModalState.ts` con API completa (open, close, toggle, setIsOpen)
    - Refactorizados JsonPlayground y JsPlayground para usar el hook
    - Eliminados estados manuales duplicados (`useState<boolean>` en cada componente)
    - Tests completos: 9 tests nuevos, cobertura 100%
  - **Resultado:** Código más limpio, +210 bytes pero mejor arquitectura para escalabilidad

- [x] **Type-safe handler factory**: Crear patrón de validación en handlers ✅
  - **Impacto:** Prevenir bugs, mejor error handling
  - **Implementado:** `utils/handlerFactory.ts` usado en `useJsonPlaygroundActions` y `JsPlayground`

- [x] **Discriminated unions para actions**: Patrón Action dispatch type-safe ✅
  - **Impacto:** Prevenir estados inválidos

#### 🟡 Baja Prioridad — Code Organization

- [x] **Centralizar tipos de configuración**: Crear `types/config.ts` genérico ✅
  - **Impacto:** Código más DRY

### 12.3 - Testing & Quality (Phase 3 - 2-4 semanas)

#### 🟠 Media Prioridad — Testing & Quality

- [x] **Aumentar coverage a 85%+**: Alcanzado 85.13%
  - **Archivos sin cobertura:** `PlaygroundCard`, `PlaygroundSidebar`, `Home`

- [x] **Agregar E2E tests (Playwright)**: Full workflow testing ✅
  - **Coverage completada:** JSON workflow, JS workflow, cross-playground navigation, responsive/mobile, edge cases
  - **Pendiente:** visual regression y suite A11y avanzada

### 12.4 - Métricas Objetivo

| Métrica              | Inicial | Actual  | Target  | Priority | Status |
| -------------------- | ------- | ------- | ------- | -------- | ------ |
| Bundle size (vendor) | 244 KB  | 182 KB  | 180 KB  | 🔴       | ✅ 99% |
| JSON Playground      | 45.7 KB | 20.5 KB | <25 KB  | 🔴       | ✅     |
| jsonWorker           | 28.3 KB | 28.1 KB | <30 KB  | 🟢       | ✅     |
| Test coverage        | 80.47%  | 85.13%  | 85%+    | 🟠       | ✅     |
| Performance (Lab)    | 85/100  | 85/100  | 95+/100 | 🟠       | 🔄     |
| Time to Interactive  | ~3.2s   | ~2.8s   | <2.5s   | 🟠       | 🔄     |

### 12.5 - Roadmap por Fases

**✅ Fase 1 (1-2 días):** Rápidas ganancias - COMPLETADA

- ✅ Memoización componentes (React.memo en JsonEditors, JsEditors, CodeEditor)
- ✅ useMemo/useCallback (objetos complejos en playgrounds)
- ✅ Lazy load Monaco (21KB chunk separado)
- ✅ Optimizar imports (zustand removido, jsonpath-plus separado 25KB)
- **Resultado:** Bundle vendor reducido 244KB → 182KB (-25%), JsonPlayground 45.7KB → 20.5KB (-55%)

**✅ Fase 2 (3-5 días):** Mejoras medianas - COMPLETADA (4/4)

- ✅ Unificar servicios (utils compartidos)
- ✅ Extract modal logic (useModalState hook)
- ✅ Type-safe handlers
- ✅ Aumentar coverage

**Fase 3 (2-4 semanas):** Enterprise quality

- Discriminated unions
- E2E tests
- Visual regression tests
- A11y testing
- Patterns guide

## 13

- Mejorar la arquitectura del proyecto
- Funcionalidades avanzadas: validación con JSON Schema

### 13.1 - Plataforma Genérica Multi-Playground

#### ✅ Implementado

- [x] **Worker client genérico compartido**: `services/worker/clientFactory.ts` usado por JSON y JS ✅
  - **Impacto:** Reducir duplicación en ciclo de vida de workers (pending map, onmessage/onerror, ids)

#### 🔄 Próximos pasos (generalización)

- [x] **Runtime genérico de operaciones async**: extraer helper común para `shouldUseWorker` + fallback sync ✅
  - **Impacto:** Menos código repetido al sumar nuevos playgrounds
- [x] **Action handlers por playground**: crear `usePlaygroundActions` base y adapters (JSON/JS) ✅
  - **Archivos:** `hooks/usePlaygroundActions.ts` (base), `hooks/useJsonPlaygroundActions.ts`, `hooks/useJsPlaygroundActions.ts`
  - **Impacto:** Reutilizar validaciones, toasts, copy/download y flujo de ejecución. JsPlayground refactorizado ~200 líneas reducidas
- [x] **Tipos de config unificados**: mover a `types/config.ts` con base `ToolConfig`/`PlaygroundConfig` ✅
  - **Archivos:** `types/config.ts` (AutoCopyConfig, ConfigWithAutoCopy, PlaygroundToolsConfig)
  - **Impacto:** Contratos consistentes para futuros playgrounds (YAML, XML, SQL, etc.)
- [x] **Toolbar actions model genérico**: estandarizar contrato de acciones (`id`, `label`, `icon`, `execute`) ✅
  - **Archivos:** `types/toolbar.ts` (ToolbarAction, ToolbarConfig, helpers)
  - **Nuevas features:** Soporte para disabled, loading, tooltip, id único
  - **Impacto:** Toolbars extensibles sin cambios estructurales en UI. JsPlayground usa tipos compartidos
- [x] **Alinear patrón Toolbar/Config entre JSON y JS** ✅
  - **Implementado:** JS mueve configuración al `Toolbar` (composición integrada) y elimina `ConfigModal` separado en playground
  - **Archivos:** `playgrounds/js/JsPlayground.tsx`, `components/layout/Toolbar.tsx`
  - **Impacto:** Patrón de composición consistente entre playgrounds, menor acoplamiento en `JsPlayground`
- [x] **Base services para transformaciones**: interfaz `transform(input, options) -> Result` ✅
  - **Archivos:** `services/transform.ts` (TransformService) + adapters en JSON/JS
  - **Impacto:** Plug & play de nuevos motores de formato/minify/clean
- [x] **Testing shared harness**: fábrica de tests para worker clients y worker async services ✅
  - **Archivos:** `test/workerHarness.ts` (defineWorkerClientTests, defineWorkerServiceTests)
  - **Impacto:** Menos boilerplate y cobertura consistente entre playgrounds

### 13.1.5 - Code Formatter & Minifier Integration (INMEDIATO - 1-2 días)

#### 🔴 Alta Prioridad - PRÓXIMAMENTE

- [x] **Prettier Integration para formateo de código** ✅
  - [x] Reemplazar Prettier interno por API de prettier package ✅
  - [x] Centralizar implementación en `services/formatter/formatter.ts` ✅
  - [x] Migrar consumidores (workers/servicios/tests) al formatter compartido ✅
  - [x] Tests: Verificar que formateo es consistente ✅
  - [x] **Beneficio:** Formateo más robusto y mantenible, usa estándares de la industria ✅

- [x] **Terser para minificación de JavaScript** ✅
  - [x] Centralizar minify JSON/JS en `services/minifier/minifier.ts` ✅
  - [x] Migrar consumers (workers/servicios/tests) al minifier compartido ✅
  - [x] Integrar `terser` package en `services/minifier/minifier.ts` ✅
  - [x] Actualizar worker para usar Terser en lugar de minificador actual ✅
  - [x] Configurar opciones: mangleNames, removeComments, compress ✅
  - [x] Tests: Validar que output es válido y más pequeño ✅
  - [x] **Beneficio:** JS minificado más agresivo y optimizado (+5-10% reducción de tamaño) ✅

- [x] **Actualizar dependencias** ✅
  - [x] `pnpm add prettier terser` ✅
  - [x] Remover minificadores internos si existen ✅
  - [x] Actualizar imports en servicios ✅

---

#### 🔴 Alta Prioridad (Próximas 2-4 semanas)

- [x] **Configurar Playwright**: Setup inicial y CI/CD integration ✅
  - **Punto de inicio:** `pnpm add -D @playwright/test` ✅
  - **Archivos creados:** `playwright.config.ts`, `.github/workflows/e2e.yml`, `e2e/smoke.spec.ts` ✅
  - **Resultado:** `pnpm e2e` ejecuta smoke tests sobre preview build ✅

- [x] **JSON Playground E2E tests** (3-4 días) ✅
  - [x] Test: Cargar JSON válido y formatear ✅
  - [x] Test: Minificar JSON ✅
  - [x] Test: Limpiar nulos y remover espacios ✅
  - [x] Test: Aplicar JSONPath queries ✅
  - [x] Test: Historial de JSONPath funciona ✅
  - [x] Test: Guardar/cargar configuración ✅
  - [x] Test: Descargar JSON formateado ✅
  - [x] Test: Copiar output al portapapeles ✅
  - [x] Test: Validación en tiempo real de errores ✅
  - [x] Test: Modal de ejemplos JSONPath ✅
  - [x] Test: Modal de configuración abre/cierra ✅
  - [x] Test: Keyboard shortcuts (Ctrl+Shift+F, Ctrl+Shift+M, etc.) ✅

- [x] **JS Playground E2E tests** (3-4 días) ✅
  - [x] Test: Ejecutar código JavaScript válido ✅
  - [x] Test: Capturar console.log outputs ✅
  - [x] Test: Mostrar errores de runtime ✅
  - [x] Test: Formatear código JS ✅
  - [x] Test: Minificar código JS ✅
  - [x] Test: Guardar/cargar configuración ✅
  - [x] Test: Descargar archivo JS ✅
  - [x] Test: Copiar input/output ✅
  - [x] Test: Validación de sintaxis en tiempo real ✅
  - [x] Test: Keyboard shortcuts (Ctrl+Shift+F, Ctrl+Shift+M, etc.) ✅

- [x] **Cross-playground navigation E2E tests** (1 día) ✅
  - [x] Test: Navegar entre playgrounds ✅
  - [x] Test: State persistence en navegación ✅
  - [x] Test: URL routing funciona ✅
  - [x] Test: Home page lista ambos playgrounds ✅

- [x] **Responsive & Mobile E2E tests** (2 días) ✅
  - [x] Test: Mobile viewport (375px) - Layout adapta ✅
  - [x] Test: Tablet viewport (768px) - Stacking funciona ✅
  - [x] Test: Desktop viewport (1920px) - Flex layout funciona ✅
  - [x] Test: Touch interactions en mobile ✅
  - [x] Test: Modal accessibility en mobile ✅

- [x] **Error handling & Edge cases E2E tests** (2 días) ✅
  - [x] Test: Large input (>500KB) - muestra mensaje tamaño límite ✅
  - [x] Test: Código JS con loop sospechoso - handled sin freeze UI ✅
  - [x] Test: localStorage lleno - fallback graceful ✅
  - [x] Test: Network offline - funcionalidad local sigue disponible ✅

#### 🟠 Media Prioridad — E2E Advanced

- [ ] **Visual regression tests** (1-2 semanas)
  - **Tool:** Playwright visual comparison
  - **Coverage:** Componentes clave en diferentes estados
  - **Archivos:** `e2e/visual/*.spec.ts`

- [ ] **A11y testing suite** (1 semana)
  - **Tool:** axe-playwright + manual audit
  - **Coverage:** Keyboard navigation, screen readers, contrast
  - **Archivos:** `e2e/a11y/*.spec.ts`

---

### 13.3 - Performance Optimization (Web Vitals & TTI)

#### 🟠 Media Prioridad — Documentation & Patterns (Próximos 3-5 días)

**Objetivo:** Mejorar baseline de performance de 85/100 a 95+/100, reducir Time to Interactive de 2.8s a <2.5s

- [x] **Performance auditing baseline** ✅
  - [x] Definir métricas objetivo (score + TTI) ✅
  - [x] Integrar validaciones de performance en CI pipeline ✅
  - [x] Establecer umbrales mínimos (95+ score) ✅
  - [x] Mantener script local de verificación de performance ✅

- [x] **Optimizaciones de carga inicial** ✅
  - [x] Critical CSS inline en HTML ✅
  - [x] Defer non-critical JS ✅
  - [x] Preload Monaco Editor early hints ✅
  - [x] Optimize font loading (system fonts vs custom) ✅

- [x] **Code splitting & lazy loading avanzado** ✅
  - [x] Dynamic import para playgrounds no visitados ✅
  - [x] Preload de worker scripts ✅

- [x] **Bundle análisis profundo** ✅
  - [x] Configurar `rollup-plugin-visualizer` ✅
  - [x] Identificar dependencias pesadas ✅
  - [x] Evaluar tree-shaking effectiveness ✅

---

### 13.4 - New Playground Implementations

#### 🟠 Media Prioridad (Próximas 5-7 semanas)

**Usando stack genérico:** clientFactory, runtime, usePlaygroundActions, ToolbarConfig, TransformService

**Fase 0 - Corregir roadmap de playgrounds:**

**Estado:** ✅ Completada (5/5)

- [x] Elegir como hacer el minificador y formatter de cada lenguaje (servicios genéricos vs específicos) ✅
  - **Decisión:** mantener orquestación genérica (`TransformService` + adapters) y motores específicos por lenguaje.
  - **Base compartida:** contratos de `format/minify/validate`, runtime de worker, handlers y configuración de toolbar.
  - **Motores por lenguaje (inicial):**
    - SQL: `sql-formatter` (sin minify agresivo, enfoque en format/validate).
    - HTML: `prettier` (format) + `html-minifier-terser` (minify).
    - CSS: `prettier` (format) + `cssnano` (minify).
    - PHP: parser/formatter específico (server-side para ejecución).
- [x] Definir alcance de features para cada playground (ej: SQL no tendrá ejecución en browser, solo parse/format/validate) ✅
  - **SQL Playground (MVP):** format, validate, lint básico.
  - **HTML Playground (MVP):** format, minify, validate básico, preview en iframe sandbox, sin fetch de recursos remotos por defecto.
  - **CSS Playground (MVP):** format, minify, validate básico, preview sobre template HTML local, sin autoprefix avanzado en primera etapa.
  - **PHP Playground (MVP):** format + validate estático; ejecución sólo vía backend sandbox/serverless, sin `eval` en navegador.
  - **Out-of-scope inicial (todos):** colaboración en tiempo real, persistencia cloud, extensiones/plugins de terceros.
- [x] Priorizar orden de implementación (HTML/CSS, luego PHP y luego SQL) ✅
  - **Orden acordado:** 1) HTML → 2) CSS → 3) PHP → 4) SQL.
- [x] Evaluar dependencias clave para cada lenguaje (ej: sql-formatter, html-minifier-terser, php-parser) ✅
  - **SQL:** `sql-formatter` (format), `node-sql-parser` (parse/validate).
  - **HTML:** `prettier` + parser `html`, `html-minifier-terser` (minify), `parse5` (parse robusto para validaciones).
  - **CSS:** `prettier` + parser `css`, `cssnano` (minify), `postcss` (pipeline de validación/transform).
  - **PHP:** `php-parser` (AST/validación), `prettier-plugin-php` (format), ejecución vía backend aislado.
  - **Alternativas consideradas:** `lightningcss` para minify CSS/transform, `js-beautify` para HTML (descartada para mantener consistencia con Prettier).
- [x] Definir contratos de servicios (ej: `format(input: string, options?: FormatOptions): Promise<string>`) ✅
  - **Contrato base (propuesto):**
    - `format(input: string, options?: FormatOptions): Promise<Result<string, ToolError>>`
    - `minify(input: string, options?: MinifyOptions): Promise<Result<string, ToolError>>`
    - `validate(input: string, options?: ValidateOptions): Promise<Result<ValidationOutput, ToolError>>`
  - **Opcional por playground:**
    - `execute?(input: string, options?: ExecuteOptions): Promise<Result<ExecuteOutput, ToolError>>`
    - `preview?(input: string, options?: PreviewOptions): Promise<Result<PreviewOutput, ToolError>>`

**Fase 1 - SQL & Web markup (5-7 semanas):**

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

- [x] **HTML Playground** (5-6 días) ✅
  - [x] **Stack/Plugins:** `prettier` (format), `html-minifier-terser` (minify), `parse5` (validación), `iframe sandbox` (preview)
  - [x] HTML validator y formatter (usando prettier)
  - [x] Implement base: `services/html/transform.ts` (format + minify)
  - [x] Minificador HTML con `html-minifier-terser` (respetando checks `minifyCss`/`minifyJs`) ✅
  - [x] Tests unitarios/branches del playground HTML
  - [x] Tests de integración (acciones/config/toolbar)
  - [x] E2E workflow HTML + navegación cross-playground
  - [x] Live preview render con iframe sandbox
  - [x] Crear `useHtmlPlaygroundActions` adapter
  - [x] Crear página: `src/playgrounds/html/HtmlPlayground.tsx`
  - [x] Split view: editor + live preview
  - [x] Inspect DOM elements

- [ ] **CSS Playground** (5-6 días)
  - [ ] **Stack/Plugins:** `prettier` parser `css` (format), `cssnano` o `lightningcss` (minify), `postcss` (pipeline/validate)
  - [ ] CSS formatter y minifier
  - [ ] Implement: `services/css/parse.ts`, `format.ts`, `minify.ts`
  - [ ] Live preview con HTML template wrapper
  - [ ] Crear `useCssPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/css/CssPlayground.tsx`
  - [ ] CSS validator integrado
  - [ ] Sugerir propiedades (autocomplete)
  - [ ] Tests unitarios (services + hooks)
  - [ ] Tests de integración (playground + preview wrapper)
  - [ ] E2E workflow CSS (format/minify/preview/config)

**Fase 2 - Programming languages (1-2 semanas):**

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

### 13.5 - Advanced Features

#### 🟡 Baja Prioridad (Próximas 4-8 semanas)

- [ ] **JSON Schema Validation**
  - [ ] Integrar `ajv` + web worker
  - [ ] Create schema editor modal
  - [ ] Real-time validation highlighting
  - [ ] Generar schema desde JSON

- [ ] **Diff Viewer**
  - [ ] Multi-tab editor (before/after)
  - [ ] Diff highlighting
  - [ ] Export differences

- [ ] **Import/Export Enhancement**
  - [ ] Soportar formatos: CSV, TOML, protobuf
  - [ ] Batch file processing

- [ ] **Colaborativo (Future)**
  - [ ] WebSocket sync entre peers
  - [ ] Presencia de usuarios (cursores)
  - [ ] Historial compartido

---

### 13.6 - Documentation & Patterns Guide

#### 🟠 Media Prioridad (Próximos 3-5 días)

- [ ] **Patterns & Best Practices Guide**
  - [ ] Crear `docs/PATTERNS.md`
  - [ ] Documentar:
    - [ ] Discriminated unions pattern (JSON/JS workers)
    - [ ] Generic worker lifecycle (clientFactory)
    - [ ] Async runtime pattern (shouldUseWorker + fallback)
    - [ ] Action handlers adapter pattern (base + playground-specific)
    - [ ] ToolbarConfig extensibility
    - [ ] TransformService contract
    - [ ] Testing with shared harness

- [ ] **Architecture Decision Records (ADR)**
  - [ ] Crear `docs/adr/` folder
  - [ ] ADR-001: Por qué discriminated unions vs plain objects
  - [ ] ADR-002: Por qué generic worker factory vs duplicación
  - [ ] ADR-003: Por qué Web Workers para JSON >100KB

---

### 13.7 - Deployment & Monitoring

#### 🟡 Baja Prioridad (Próximas 2-3 semanas)

- [ ] **Production Monitoring**
  - [ ] Sentry integration para error tracking
  - [ ] Web Vitals reporting
  - [ ] User session analytics

- [ ] **CI/CD Enhancement**
  - [ ] E2E tests en PR validation
  - [ ] Performance budget checks
  - [ ] Bundle size monitoring
  - [ ] Visual regression checks en PRs

- [ ] **Vercel Optimization**
  - [ ] Edge functions para transform preview
  - [ ] Serverless functions para heavy processing
  - [ ] Analytics integración

- [ ] **Uptime & Reliability**
  - [ ] Health check endpoint
  - [ ] Redundancy strategy
  - [ ] CDN optimization

---

## 📋 Resumen de Pendientes

| Sección                       | Estimación  | Prioridad | Status         |
| ----------------------------- | ----------- | --------- | -------------- |
| 13.1.5 Formatter & Minifier   | 1-2 días    | 🔴 Alta   | ✅ Completado  |
| 13.2 E2E Testing              | 2-4 semanas | 🔴 Alta   | 🔄 En progreso |
| 13.3 Performance Optimization | 3-5 días    | 🟠 Media  | 🔄 En progreso |
| 13.4 New Playgrounds          | 3-4 semanas | 🟠 Media  | ⏳ Pendiente   |
| 13.5 Advanced Features        | 4-8 semanas | 🟡 Baja   | ⏳ Pendiente   |
| 13.6 Documentation            | 3-5 días    | 🟠 Media  | ⏳ Pendiente   |
| 13.7 Deployment & Monitoring  | 2-3 semanas | 🟡 Baja   | ⏳ Pendiente   |

**Total Estimado:** 10-20 semanas de trabajo

**Recomendado por impacto/esfuerzo:** 0. ✅ **13.1.5** → Prettier + Terser (completado)

1. 🔄 **13.3** → Performance optimization (3-5 días, +10 puntos en baseline de performance)
2. 🔄 **13.2** → E2E testing (cerrar bloque advanced)
3. ⏳ **13.4 Fase 1** → Data & Web playgrounds (SQL, HTML, CSS)
4. ⏳ **13.6** → Documentation (3-5 días, facilita nuevas contribuciones)
5. ⏳ **13.4 Fase 2** → PHP playground (1-2 semanas, server-side support)

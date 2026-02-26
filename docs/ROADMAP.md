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

#### 🔴 Alta Prioridad

- [x] **Duplicación de iconColors**: Crear constante compartida en `utils/constants/` para `iconColors` usado en `Panel.tsx` y `ExpandedEditorModal.tsx` ✅
- [x] **Tipos de configuración dispersos**: Centralizar interfaces de configuración (`formatConfig`, `minifyConfig`, `cleanConfig`) en `types/json.ts` ✅
- [x] **Servicios de localStorage**: Crear `services/storage.ts` con funciones genéricas de persistencia (`loadSavedConfig`, `loadLastJson`, etc.) ✅

#### 🟠 Media Prioridad

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
    - Eliminados estados manuales duplicados (useState<boolean> en cada componente)
    - Tests completos: 9 tests nuevos, cobertura 100%
  - **Resultado:** Código más limpio, +210 bytes pero mejor arquitectura para escalabilidad

- [x] **Type-safe handler factory**: Crear patrón de validación en handlers ✅
  - **Impacto:** Prevenir bugs, mejor error handling
  - **Implementado:** `utils/handlerFactory.ts` usado en `useJsonPlaygroundActions` y `JsPlayground`

- [x] **Discriminated unions para actions**: Patrón Action dispatch type-safe ✅
  - **Impacto:** Prevenir estados inválidos

#### 🟡 Baja Prioridad

- [x] **Centralizar tipos de configuración**: Crear `types/config.ts` genérico ✅
  - **Impacto:** Código más DRY

### 12.3 - Testing & Quality (Phase 3 - 2-4 semanas)

#### 🟠 Media Prioridad

- [x] **Aumentar coverage a 85%+**: Alcanzado 85.13%
  - **Archivos sin cobertura:** `PlaygroundCard`, `PlaygroundSidebar`, `Home`

- [ ] **Agregar E2E tests (Playwright)**: Full workflow testing
  - **Coverage:** JSON workflow, JS workflow, cross-playground navigation

### 12.4 - Métricas Objetivo

| Métrica              | Inicial | Actual  | Target  | Priority | Status |
| -------------------- | ------- | ------- | ------- | -------- | ------ |
| Bundle size (vendor) | 244 KB  | 182 KB  | 180 KB  | 🔴       | ✅ 99% |
| JSON Playground      | 45.7 KB | 20.5 KB | <25 KB  | 🔴       | ✅     |
| jsonWorker           | 28.3 KB | 28.1 KB | <30 KB  | 🟢       | ✅     |
| Test coverage        | 80.47%  | 85.13%  | 85%+    | 🟠       | ✅     |
| Lighthouse score     | 85/100  | 85/100  | 95+/100 | 🟠       | 🔄     |
| Time to Interactive  | ~3.2s   | ~2.8s   | <2.5s   | 🟠       | 🔄     |

### 12.5 - Roadmap por Fases

**✅ Fase 1 (1-2 días):** Rápidas ganancias - COMPLETADA

- ✅ Memoización componentes (React.memo en JsonEditors, JsEditors, CodeEditor)
- ✅ useMemo/useCallback (objetos complejos en playgrounds)
- ✅ Lazy load Monaco (21KB chunk separado)
- ✅ Optimizar imports (zustand removido, jsonpath-plus separado 25KB)
- **Resultado:** Bundle vendor reducido 244KB → 182KB (-25%), JsonPlayground 45.7KB → 20.5KB (-55%)

**🔄 Fase 2 (3-5 días):** Mejoras medianas - EN PROGRESO (2/4)

- ✅ Unificar servicios (utils compartidos)
- ✅ Extract modal logic (useModalState hook)
- [ ] Type-safe handlers
- [ ] Aumentar coverage

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

- [ ] **JSON Playground E2E tests** (3-4 días)
  - [ ] Test: Cargar JSON válido y formatear
  - [ ] Test: Minificar JSON
  - [ ] Test: Limpiar nulos y remover espacios
  - [ ] Test: Aplicar JSONPath queries
  - [ ] Test: Historial de JSONPath funciona
  - [ ] Test: Guardar/cargar configuración
  - [ ] Test: Descargar JSON formateado
  - [ ] Test: Copiar output al portapapeles
  - [ ] Test: Validación en tiempo real de errores
  - [ ] Test: Modal de ejemplos JSONPath
  - [ ] Test: Modal de configuración abre/cierra
  - [ ] Test: Keyboard shortcuts (Ctrl+Shift+F, Ctrl+Shift+M, etc.)

- [ ] **JS Playground E2E tests** (3-4 días)
  - [ ] Test: Ejecutar código JavaScript válido
  - [ ] Test: Capturar console.log outputs
  - [ ] Test: Mostrar errores de runtime
  - [ ] Test: Formatear código JS
  - [ ] Test: Minificar código JS
  - [ ] Test: Guardar/cargar configuración
  - [ ] Test: Descargar archivo JS
  - [ ] Test: Copiar input/output
  - [ ] Test: Validación de sintaxis en tiempo real
  - [ ] Test: Keyboard shortcuts (Ctrl+Shift+F, Ctrl+Shift+M, etc.)

- [ ] **Cross-playground navigation E2E tests** (1 día)
  - [ ] Test: Navegar entre playgrounds
  - [ ] Test: State persistence en navegación
  - [ ] Test: URL routing funciona
  - [ ] Test: Home page lista ambos playgrounds

- [ ] **Responsive & Mobile E2E tests** (2 días)
  - [ ] Test: Mobile viewport (375px) - Layout adapta
  - [ ] Test: Tablet viewport (768px) - Stacking funciona
  - [ ] Test: Desktop viewport (1920px) - Flex layout funciona
  - [ ] Test: Touch interactions en mobile
  - [ ] Test: Modal accessibility en mobile

- [ ] **Error handling & Edge cases E2E tests** (2 días)
  - [ ] Test: JSON inválido - muestra error
  - [ ] Test: JS inválido - muestra error
  - [ ] Test: Archivo muy grande (>100MB) - manejo elegante
  - [ ] Test: Código JS infinito - timeout después de 5s
  - [ ] Test: localStorage lleno - fallback graceful
  - [ ] Test: Network offline - funcionalidad local

#### 🟠 Media Prioridad

- [ ] **Visual regression tests** (1-2 semanas)
  - **Tool:** Playwright visual comparison
  - **Coverage:** Componentes clave en diferentes estados
  - **Archivos:** `e2e/visual/*.spec.ts`

- [ ] **A11y testing suite** (1 semana)
  - **Tool:** axe-playwright + manual audit
  - **Coverage:** Keyboard navigation, screen readers, contrast
  - **Archivos:** `e2e/a11y/*.spec.ts`

---

### 13.3 - Performance Optimization (Lighthouse & TTI)

#### 🟠 Media Prioridad (Próximos 3-5 días)

**Objetivo:** Mejorar Lighthouse score de 85/100 a 95+/100, reducir Time to Interactive de 2.8s a <2.5s

- [ ] **Performance auditing con Lighthouse CI**
  - [ ] Crear `lighthouse-config.json`
  - [ ] Integrar con CI pipeline
  - [ ] Establecer umbrales mínimos (95+ score)

- [ ] **Optimizaciones de carga inicial**
  - [ ] Critical CSS inline en HTML
  - [ ] Defer non-critical JS
  - [ ] Preload Monaco Editor early hints
  - [ ] Optimize font loading (system fonts vs custom)

- [ ] **Code splitting & lazy loading avanzado**
  - [ ] Dynamic import para playgrounds no visitados
  - [ ] Preload de worker scripts

- [ ] **Image optimization**
  - [ ] Usar WebP con fallback
  - [ ] Responsive images (srcset)
  - [ ] Lazy loading de imágenes

- [ ] **Bundle análisis profundo**
  - [ ] Configurar `rollup-plugin-visualizer`
  - [ ] Identificar dependencias pesadas
  - [ ] Evaluar tree-shaking effectiveness

#### 🟡 Baja Prioridad

- [ ] **Métricas en producción**
  - [ ] Web Vitals tracking (CLS, LCP, FID)
  - [ ] Integrar con analytics

---

### 13.4 - New Playground Implementations

#### 🟠 Media Prioridad (Próximas 5-7 semanas)

**Usando stack genérico:** clientFactory, runtime, usePlaygroundActions, ToolbarConfig, TransformService

**Fase 1 - SQL & Web markup (5-7 semanas):**

- [ ] **SQL Playground** (5-7 días)
  - [ ] Integrar SQL formatter/parser (sql-formatter)
  - [ ] Implement: `services/sql/parse.ts`, `format.ts`, `validate.ts`
  - [ ] Query execution (SQLite in-browser con sql.js)
  - [ ] Crear `useSqlPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/sql/SqlPlayground.tsx`
  - [ ] Tab para results/schema visualization

- [ ] **HTML Playground** (5-6 días)
  - [ ] HTML validator y formatter (usando prettier)
  - [ ] Implement: `services/html/parse.ts`, `format.ts`, `minify.ts`
  - [ ] Minificador: integrar `html-minifier-terser` en `minify.ts`
  - [ ] Live preview render con iframe sandbox
  - [ ] Crear `useHtmlPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/html/HtmlPlayground.tsx`
  - [ ] Split view: editor + live preview
  - [ ] Inspect DOM elements

- [ ] **CSS Playground** (5-6 días)
  - [ ] CSS formatter y minifier
  - [ ] Implement: `services/css/parse.ts`, `format.ts`, `minify.ts`
  - [ ] Live preview con HTML template wrapper
  - [ ] Crear `useCssPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/css/CssPlayground.tsx`
  - [ ] CSS validator integrado
  - [ ] Sugerir propiedades (autocomplete)

**Fase 2 - Programming languages (1-2 semanas):**

- [ ] **PHP Playground** (6-8 días)
  - [ ] Integrar PHP parser/formatter
  - [ ] Implement: `services/php/parse.ts`, `format.ts`, `validate.ts`
  - [ ] Backend execution en serverless (Vercel Functions)
  - [ ] Crear `usePhpPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/php/PhpPlayground.tsx`
  - [ ] Highlight syntax errors
  - [ ] Output capture (sin ejecución en-browser, call API)
  - [ ] E2E tests

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

- [ ] **Contribute Guide**
  - [ ] Crear `CONTRIBUTE.md`
  - [ ] Setup local development
  - [ ] Adding a new playground (step-by-step)
  - [ ] Testing requirements
  - [ ] PR checklist

- [ ] **API Documentation**
  - [ ] JSDoc improvements en servicios clave
  - [ ] TypeDoc generation
  - [ ] Readme updates

---

### 13.7 - Deployment & Monitoring

#### 🟡 Baja Prioridad (Próximas 2-3 semanas)

- [ ] **Production Monitoring**
  - [ ] Sentry integration para error tracking
  - [ ] Web Vitals reporting
  - [ ] User session analytics

- [ ] **CI/CD Enhancement**
  - [ ] E2E tests en PR validation
  - [ ] Lighthouse CI checks
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

| Sección                       | Estimación  | Prioridad | Status       |
| ----------------------------- | ----------- | --------- | ------------ |
| 13.1.5 Formatter & Minifier   | 1-2 días    | 🔴 Alta   | ⏳ Inmediato |
| 13.2 E2E Testing              | 2-4 semanas | 🔴 Alta   | ⏳ Pendiente |
| 13.3 Performance Optimization | 3-5 días    | 🟠 Media  | ⏳ Pendiente |
| 13.4 New Playgrounds          | 3-4 semanas | 🟠 Media  | ⏳ Pendiente |
| 13.5 Advanced Features        | 4-8 semanas | 🟡 Baja   | ⏳ Pendiente |
| 13.6 Documentation            | 3-5 días    | 🟠 Media  | ⏳ Pendiente |
| 13.7 Deployment & Monitoring  | 2-3 semanas | 🟡 Baja   | ⏳ Pendiente |

**Total Estimado:** 10-20 semanas de trabajo

**Recomendado por impacto/esfuerzo:** 0. ✅ **13.1.5** → Prettier + Terser (1-2 días, integración rápida y mejoría visible)

1. ✅ **13.3** → Performance optimization (3-5 días, +10 Lighthouse points)
2. ✅ **13.2** → E2E testing (2-4 semanas, garantiza quality)
3. ✅ **13.4 Fase 1** → Data & Web playgrounds (SQL, HTML, CSS: 3-4 semanas, valida stack genérico)
4. ✅ **13.6** → Documentation (3-5 días, facilita nuevas contribuciones)
5. ✅ **13.4 Fase 2** → PHP playground (1-2 semanas, server-side support)

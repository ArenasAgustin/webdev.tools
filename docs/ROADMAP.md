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
- [ ] **Stories avanzadas**: Estados de error, loading, interacciones, variantes edge-case
- [ ] **Accessibility testing**: Optimizar addon-a11y y crear historias con verificación automatizada

## 12 - Refactoring & Performance Optimization

### 12.1 - Performance & Rendering (Phase 1 - 1-2 días)

#### 🔴 Alta Prioridad

- [ ] **Memoizar componentes complejos**: `JsonEditors`, `JsEditors`, `CodeEditor`
  - **Impacto:** 10-15% mejora responsividad con JSON >1MB
  - **Estimado:** 2-3h
- [ ] **useMemo & useCallback en playgrounds**: Evitar recreación de handlers y objetos
  - **Impacto:** Prevenir re-renders innecesarios en Toolbar
  - **Estimado:** 3-4h
- [ ] **Lazy Load Monaco Editor**: Reducir bundle inicial en 200KB
  - **Impacto:** -26% tamaño bundle (244KB → 180KB)
  - **Estimado:** 2h
  - **Status:** Parcialmente hecho en `LazyCodeEditor.tsx`, falta completar

- [ ] **Optimizar imports**: Mejorar tree-shaking (-20 KB)
  - **Impacto:** Eliminar imports genéricos innecesarios
  - **Estimado:** 2h

### 12.2 - Code Organization (Phase 2 - 3-5 días)

#### 🟠 Media Prioridad

- [ ] **Unificar servicios JSON/JS**: Crear `services/format/`, `services/minify/` genéricos
  - **Impacto:** -300 líneas duplicadas, mejor escalabilidad
  - **Estimado:** 4-5h
  - **Archivos:** `services/json/format.ts`, `services/js/format.ts`, minify, etc.

- [ ] **Extraer lógica de modales a hooks**: `useModalState`, `useFormState`
  - **Impacto:** Mejor testabilidad, código más limpio
  - **Estimado:** 2-3h
  - **Uso:** Simplificar estado en `Toolbar`, `JsonPlayground`, `JsPlayground`

- [ ] **Type-safe handler factory**: Crear patrón de validación en handlers
  - **Impacto:** Prevenir bugs, mejor error handling
  - **Estimado:** 2h

- [ ] **Discriminated unions para actions**: Patrón Action dispatch type-safe
  - **Impacto:** Prevenir estados inválidos
  - **Estimado:** 3-4h

#### 🟡 Baja Prioridad

- [ ] **Centralizar tipos de configuración**: Crear `types/config.ts` genérico
  - **Impacto:** Código más DRY
  - **Estimado:** 2h

- [ ] **Guía de patrones**: Crear `docs/PATTERNS.md`
  - **Impacto:** Mejor onboarding, arquitectura documentada
  - **Estimado:** 3h

### 12.3 - Testing & Quality (Phase 3 - 2-4 semanas)

#### 🟠 Media Prioridad

- [ ] **Aumentar coverage a 85%+**: Actualmente 80.47%
  - **Archivos sin cobertura:** `PlaygroundCard`, `PlaygroundSidebar`, `Home`
  - **Estimado:** 3-4h

- [ ] **Agregar E2E tests (Playwright)**: Full workflow testing
  - **Coverage:** JSON workflow, JS workflow, cross-playground navigation
  - **Estimado:** 6-8h

#### 🟡 Baja Prioridad

- [ ] **Visual regression tests**: Setup Percy o similar
  - **Estimado:** 4-5h setup + tests

- [ ] **Accessibility testing (a11y)**: Jest-axe integration
  - **Estimado:** 4-6h

- [ ] **Performance metrics**: Web Vitals integration
  - **Estimado:** 2h

### 12.4 - Métricas Objetivo

| Métrica             | Actual | Target  | Priority |
| ------------------- | ------ | ------- | -------- |
| Bundle size (main)  | 244 KB | 180 KB  | 🔴       |
| Test coverage       | 80.47% | 85%+    | 🟠       |
| Lighthouse score    | 85/100 | 95+/100 | 🟠       |
| Time to Interactive | ~3.2s  | <2.5s   | 🟠       |

### 12.5 - Roadmap por Fases

**Fase 1 (1-2 días):** Rápidas ganancias

- Memoización componentes
- useMemo/useCallback
- Lazy load Monaco
- Optimizar imports
- **Total:** ~8h | **Impact:** 15-20% perf improvement

**Fase 2 (3-5 días):** Mejoras medianas

- Unificar servicios
- Extract modal logic
- Type-safe handlers
- Aumentar coverage
- **Total:** ~14h | **Impact:** -100KB bundle + maintainability

**Fase 3 (2-4 semanas):** Enterprise quality

- Discriminated unions
- E2E tests
- Visual regression tests
- A11y testing
- Patterns guide
- **Total:** ~25h | **Impact:** Production-ready quality

## 13

- Funcionalidades avanzadas: validación con JSON Schema

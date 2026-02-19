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

- [ ] **Extraer lógica de modales a hooks**: `useModalState`, `useFormState`
  - **Impacto:** Mejor testabilidad, código más limpio
  - **Uso:** Simplificar estado en `Toolbar`, `JsonPlayground`, `JsPlayground`

- [ ] **Type-safe handler factory**: Crear patrón de validación en handlers
  - **Impacto:** Prevenir bugs, mejor error handling

- [ ] **Discriminated unions para actions**: Patrón Action dispatch type-safe
  - **Impacto:** Prevenir estados inválidos

#### 🟡 Baja Prioridad

- [ ] **Centralizar tipos de configuración**: Crear `types/config.ts` genérico
  - **Impacto:** Código más DRY

### 12.3 - Testing & Quality (Phase 3 - 2-4 semanas)

#### 🟠 Media Prioridad

- [ ] **Aumentar coverage a 85%+**: Actualmente 80.47%
  - **Archivos sin cobertura:** `PlaygroundCard`, `PlaygroundSidebar`, `Home`

- [ ] **Agregar E2E tests (Playwright)**: Full workflow testing
  - **Coverage:** JSON workflow, JS workflow, cross-playground navigation

### 12.4 - Métricas Objetivo

| Métrica              | Inicial | Actual  | Target  | Priority | Status |
| -------------------- | ------- | ------- | ------- | -------- | ------ |
| Bundle size (vendor) | 244 KB  | 182 KB  | 180 KB  | 🔴       | ✅ 99% |
| JSON Playground      | 45.7 KB | 20.5 KB | <25 KB  | 🔴       | ✅     |
| jsonWorker           | 28.3 KB | 28.1 KB | <30 KB  | 🟢       | ✅     |
| Test coverage        | 80.47%  | 81%+    | 85%+    | 🟠       | 🔄     |
| Lighthouse score     | 85/100  | 85/100  | 95+/100 | 🟠       | 🔄     |
| Time to Interactive  | ~3.2s   | ~2.8s   | <2.5s   | 🟠       | 🔄     |

### 12.5 - Roadmap por Fases

**✅ Fase 1 (1-2 días):** Rápidas ganancias - COMPLETADA

- ✅ Memoización componentes (React.memo en JsonEditors, JsEditors, CodeEditor)
- ✅ useMemo/useCallback (objetos complejos en playgrounds)
- ✅ Lazy load Monaco (21KB chunk separado)
- ✅ Optimizar imports (zustand removido, jsonpath-plus separado 25KB)
- **Resultado:** Bundle vendor reducido 244KB → 182KB (-25%), JsonPlayground 45.7KB → 20.5KB (-55%)

**🔄 Fase 2 (3-5 días):** Mejoras medianas - EN PROGRESO (1/4)

- Unificar servicios
- Extract modal logic
- Type-safe handlers
- Aumentar coverage

**Fase 3 (2-4 semanas):** Enterprise quality

- Discriminated unions
- E2E tests
- Visual regression tests
- A11y testing
- Patterns guide

## 13

- Funcionalidades avanzadas: validación con JSON Schema

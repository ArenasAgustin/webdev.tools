# Playground Contract (Arquitectura Base)

Este documento define el contrato obligatorio que debe cumplir cualquier playground del proyecto.

## 1) Estado mínimo obligatorio

Cada playground debe manejar como mínimo:

- `input` (ej. `inputCss`, `inputJson`)
- `output` (`useState<string>("")` explícito)
- `error` (`useState<string | null>(null)` explícito)
- `formatConfig` (via `useMergedConfigState`)
- `minifyConfig` (via `useMergedConfigState`)

Además, debe incluir:

- `useModalState` para configuración
- `usePlaygroundInputLifecycle` para debounce, persistencia y warning de tamaño
- `useToast` para notificaciones

## 2) Validación

Cada playground debe tener un hook parser/validator dedicado:

- `useJsonParser`
- `useJsParser`
- `useHtmlParser`
- `useCssParser`

El estado de validación debe ser mostrado por el editor correspondiente (`*Editors.tsx`).

## 3) Acciones de toolbar

Cada playground debe usar un hook `use*PlaygroundActions` que:

- Usa `usePlaygroundActions` para acciones base
- Usa `useTransformActions` para format/minify
- Usa `compactTransformError` para manejo de errores
- Recibe `setOutput` y `setError` directamente (sin callbacks indirectas)

Debe exponer como mínimo:

- `handleClearInput`
- `handleLoadExample`
- `handleCopyOutput`
- `handleDownloadInput`
- `handleDownloadOutput`
- `handleFormat`
- `handleMinify`

Si el dominio lo requiere (ej. JSON/JS), puede agregar acciones específicas.

## 4) Persistencia

Cada playground debe persistir:

- último input (`loadLast*` / `saveLast*`)
- configuración de herramientas (`load<Lang>ToolsConfig` / `save<Lang>ToolsConfig`)

Las funciones de storage deben tener prefijo del lenguaje (ej. `loadJsonToolsConfig`, `saveCssToolsConfig`).
No se permite persistencia fuera de almacenamiento local del navegador.

## 5) Atajos de teclado

Debe integrarse `usePlaygroundShortcuts` (wrapper de `useKeyboardShortcuts`) con, como mínimo:

- `onFormat`
- `onMinify`
- `onCopyOutput`
- `onClearInput`
- `onOpenConfig`

## 6) Estructura de archivos por playground

Cada playground debe mantener esta estructura en `src/playgrounds/<lang>/`:

- `<lang>.config.ts` — configuración del playground
- `<Lang>Playground.tsx` — componente principal
- `<Lang>Editors.tsx` — paneles de editor
- `index.ts` — exports públicos

Tests obligatorios:

- `<Lang>Playground.test.tsx` — render + flujo feliz
- `<Lang>Playground.branches.test.tsx` — branches de error/config/size
- `<Lang>Editors.test.tsx` — editores

Y su hook de acciones en `src/hooks/`:

- `use<Lang>PlaygroundActions.ts`
- `use<Lang>Parser.ts` (+ test)

Servicios en `src/services/<lang>/`:

- `service.ts`, `transform.ts`, `worker.ts`, `workerClient.ts`, `worker.types.ts`

## 7) Contratos compartidos obligatorios

- `src/types/config.ts`
- `src/types/toolbar.ts`
- `src/services/transform.ts`

Todos los playgrounds deben alinearse con estos contratos y extenderlos sin romper compatibilidad.

## 8) Testing mínimo por playground

- Unit: servicios + hooks
- Integración: playground + toolbar/config
- E2E: workflow feliz + persistencia de configuración

## 9) Extensiones permitidas

Se permiten diferencias solo por lógica de dominio, por ejemplo:

- JSONPath / historial / tips modals (JSON)
- `handleClean` + cleanConfig (JSON)
- ejecución controlada con `new Function` + detección de loops (JS)
- preview HTML + `inspectDom` (HTML)

Estas extensiones se deben manejar como props opcionales, slots (`extraContent` en Toolbar), o lógica adicional en el actions hook.

No se permite cambiar la arquitectura base por playground.

## 10) Especificación: obligatorio vs extensible

### 10.1 Obligatorio (todos los playgrounds)

- Estructura mínima de archivos:
  - `*.config.ts`
  - `*Playground.tsx`
  - `*Editors.tsx`
  - `index.ts`
  - `src/hooks/use*PlaygroundActions.ts`
- Estado base:
  - `input`, `output`, `error`, `formatConfig`, `minifyConfig`
- Hooks base:
  - `useModalState`
  - `useDebouncedValue`
  - `useTextStats`
  - `useKeyboardShortcuts`
  - `use*Parser`
- Acciones base del hook de playground:
  - `handleClearInput`, `handleLoadExample`
  - `handleCopyOutput`, `handleDownloadInput`, `handleDownloadOutput`
  - `handleFormat`, `handleMinify`
- Persistencia local:
  - `loadLast*` / `saveLast*`
  - `load*ToolsConfig`
- Contratos compartidos:
  - `src/types/config.ts`
  - `src/types/toolbar.ts`
  - `src/services/transform.ts`
- Testing mínimo:
  - Unit (services + hooks)
  - Integración (playground + toolbar/config)
  - E2E (workflow feliz + persistencia)

### 10.2 Extensible (por lenguaje)

- Acciones de dominio adicionales:
  - JSON: JSONPath, historial
  - JS: ejecución controlada
  - HTML: preview/sandbox
- Servicios de dominio:
  - parse/validate/execute/preview específicos
- Controles de configuración extra:
  - checks/flags propios de cada lenguaje
- UI adicional de dominio:
  - paneles/tablas/preview si no rompe layout base

### 10.3 Prohibido en extensiones

- Romper contratos compartidos o sus firmas públicas.
- Eliminar hooks base obligatorios.
- Cambiar el flujo base de acciones/persistencia por uno incompatible.
- Introducir dependencias o patrones fuera del stack aprobado en `docs/AI_CONTEXT.md`.

## 11) Criterio de conformidad

Un playground es conforme si:

- Cumple todos los puntos de la sección **10.1 Obligatorio**.
- Sus diferencias están únicamente en **10.2 Extensible**.
- No incurre en ningún punto de **10.3 Prohibido**.

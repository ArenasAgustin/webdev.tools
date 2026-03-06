# Playground Contract (Arquitectura Base)

Este documento define el contrato obligatorio que debe cumplir cualquier playground del proyecto.

## 1) Estado mínimo obligatorio

Cada playground debe manejar como mínimo:

- `input`
- `output`
- `error`
- `formatConfig`
- `minifyConfig`

Además, debe incluir:

- `useModalState` para configuración
- `useDebouncedValue` para persistencia/validación
- `useTextStats` para límite de tamaño
- warning de tamaño con `MAX_INPUT_BYTES`

## 2) Validación

Cada playground debe tener un hook parser/validator dedicado:

- `useJsonParser`
- `useJsParser`
- `useHtmlParser`
- `useCssParser`

El estado de validación debe ser mostrado por el editor correspondiente (`*Editors.tsx`).

## 3) Acciones de toolbar

Cada playground debe usar un hook `use*PlaygroundActions` que exponga como mínimo:

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
- configuración de herramientas (`load*ToolsConfig`)

No se permite persistencia fuera de almacenamiento local del navegador.

## 5) Atajos de teclado

Debe integrarse `useKeyboardShortcuts` con, como mínimo:

- `onFormat`
- `onMinify`
- `onCopyOutput`
- `onClearInput`
- `onOpenConfig`

## 6) Estructura de archivos por playground

Cada playground debe mantener esta estructura:

- `*.config.ts`
- `*Playground.tsx`
- `*Editors.tsx`
- `index.ts`

Y su hook de acciones en `src/hooks`:

- `use*PlaygroundActions.ts`

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

- JSONPath / historial (JSON)
- ejecución controlada con `new Function` (JS)
- preview (HTML)

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

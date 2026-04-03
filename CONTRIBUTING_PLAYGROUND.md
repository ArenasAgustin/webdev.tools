# Guía de Contribución — Nuevos Playgrounds

Esta guía describe los pasos exactos para agregar un nuevo playground al proyecto.
Sigue el orden indicado — cada paso depende del anterior.

> **Referencia rápida:** Usa `pnpm verify:arch` en cualquier momento para validar que todos los archivos requeridos existen.

---

## Requisitos previos

Antes de empezar, asegúrate de tener claro:

1. **Nombre del lenguaje** (ej. `sql`, `yaml`, `markdown`). Debe ser un identificador en minúsculas.
2. **Bibliotecas necesarias** para formatear, minificar y validar. Elige librerías que funcionen en el navegador (client-side).
3. **Extensiones de dominio** Si el playground necesita funcionalidad extra (ejecución, preview, filtrado), define cuáles antes de empezar.

---

## Paso 1 — Tipos del playground

Crear `src/types/<lang>.ts`:

```ts
import type { ConfigWithAutoCopy, PlaygroundToolsConfig } from "@/types/config";
import type { IndentStyle } from "@/types/format";

// Configuración de formato
export type <Lang>FormatConfig = ConfigWithAutoCopy<{
  indentSize: IndentStyle;
  // propiedades específicas del lenguaje
}>;

// Configuración de minificación
export type <Lang>MinifyConfig = ConfigWithAutoCopy<{
  removeComments: boolean;
  // propiedades específicas del lenguaje
}>;

// Config agrupada
export type <Lang>ToolsConfig = PlaygroundToolsConfig<{
  format: <Lang>FormatConfig;
  minify: <Lang>MinifyConfig;
}>;

// Valores por defecto
export const DEFAULT_<LANG>_FORMAT_CONFIG: <Lang>FormatConfig = {
  indentSize: 2,
  autoCopy: false,
};

export const DEFAULT_<LANG>_MINIFY_CONFIG: <Lang>MinifyConfig = {
  removeComments: true,
  autoCopy: false,
};

export const DEFAULT_<LANG>_TOOLS_CONFIG: <Lang>ToolsConfig = {
  format: DEFAULT_<LANG>_FORMAT_CONFIG,
  minify: DEFAULT_<LANG>_MINIFY_CONFIG,
};
```

---

## Paso 2 — Servicio de transformación

Crear `src/services/<lang>/transform.ts`:

```ts
import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";

export async function format<Lang>(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  // Implementar formato
}

export function minify<Lang>(
  input: string,
  options: { removeComments?: boolean } = {},
): Promise<Result<string, string>> {
  // Implementar minificación
}
```

Crear `src/services/<lang>/transform.test.ts` con tests para cada función pura.

---

## Paso 3 — Worker infrastructure

### 3a. Worker types (`src/services/<lang>/worker.types.ts`)

```ts
import type { JsonError } from "@/types/common";
import type { WorkerPayloadBase, WorkerRequest, WorkerResponse } from "@/services/worker/types";

export type <Lang>WorkerPayload =
  | ({ action: "format"; options?: { indentSize?: number } } & WorkerPayloadBase)
  | ({ action: "minify"; options?: { removeComments?: boolean } } & WorkerPayloadBase);

export type <Lang>WorkerRequest = WorkerRequest<<Lang>WorkerPayload>;
export type <Lang>WorkerResponse = WorkerResponse<JsonError>;
```

### 3b. Worker client (`src/services/<lang>/workerClient.ts`)

```ts
import type { <Lang>WorkerPayload, <Lang>WorkerRequest, <Lang>WorkerResponse } from "./worker.types";
import { createPlaygroundWorkerAdapter } from "@/services/worker/adapter";

const adapter = createPlaygroundWorkerAdapter<
  <Lang>WorkerPayload, <Lang>WorkerRequest, <Lang>WorkerResponse
>({
  workerUrl: new URL("../../workers/<lang>Worker.ts?worker", import.meta.url),
  idPrefix: "<lang>-worker",
  unavailableMessage: "Worker no disponible",
  buildRequest: (id, payload) => ({ id, ...payload }),
});

export const run<Lang>Worker = adapter.run;
export const preload<Lang>Worker = () => { adapter.preload(); };
```

### 3c. Worker orchestration (`src/services/<lang>/worker.ts`)

Sigue el patrón de `src/services/css/worker.ts`:

- Usa `executeWorkerOperation` de `@/services/worker/runtime`
- Exporta funciones async: `format<Lang>Async`, `minify<Lang>Async`
- Cada función delega al worker para inputs grandes y fallback a sync

### 3d. Web worker (`src/workers/<lang>Worker.ts`)

Sigue el patrón de `src/workers/cssWorker.ts`:

- Importa funciones de `@/services/<lang>/transform`
- Maneja mensajes con switch por action
- Convierte Result a WorkerResponse

### 3e. Service facade (`src/services/<lang>/service.ts`)

```ts
import type { PlaygroundTransformService } from "@/services/transform";
import { createNonEmptyValidator } from "@/services/transform";
import { format<Lang>Async, minify<Lang>Async } from "./worker";

export const <lang>Service: PlaygroundTransformService<FormatOptions, MinifyOptions, string> = {
  format: async (input, options) => { /* ... */ },
  minify: async (input, options) => { /* ... */ },
  validate: createNonEmptyValidator(() => "No hay <lang> para procesar"),
};
```

### 3f. Tests de worker

- `src/services/<lang>/worker.test.ts` — usa `defineWorkerServiceTests` de `@/test/workerHarness`
- `src/services/<lang>/workerClient.test.ts` — usa `defineWorkerClientTests` de `@/test/workerHarness`

---

## Paso 4 — Persistencia

Agregar en `src/services/storage.ts`:

- `STORAGE_KEYS.LAST_<LANG>` y `STORAGE_KEYS.<LANG>_TOOLS_CONFIG`
- `loadLast<Lang>()` / `saveLast<Lang>()`
- `load<Lang>ToolsConfig()` / `save<Lang>ToolsConfig()`

Seguir el patrón existente con `getStorage()` y try/catch.

---

## Paso 5 — Hooks

### 5a. Parser/Validator (`src/hooks/use<Lang>Parser.ts`)

Hook que valida el input debounced y retorna `{ isValid, error }`.
Crear su test: `src/hooks/use<Lang>Parser.test.ts`.

### 5b. Playground actions (`src/hooks/use<Lang>PlaygroundActions.ts`)

Sigue el patrón de `useCssPlaygroundActions`:

1. Usa `usePlaygroundActions` para acciones base (clear, load example, copy, download)
2. Usa `useTransformActions` para format/minify
3. Usa `compactTransformError` en los `onError` callbacks
4. Recibe `setOutput` y `setError` directamente como props
5. Expone handlers memoizados con `useCallback`

---

## Paso 6 — Componentes del playground

### 6a. Config (`src/playgrounds/<lang>/<lang>.config.ts`)

```ts
import type { PlaygroundConfig } from "@/types/playground";

export const <lang>PlaygroundConfig: PlaygroundConfig = {
  id: "<lang>",
  name: "<Lang> Tools",
  icon: "fas fa-...",
  description: "Formatear y minificar <lang>",
  language: "<lang>",
  example: `...`,
};
```

### 6b. Editors (`src/playgrounds/<lang>/<Lang>Editors.tsx`)

Sigue el patrón de `CssEditors.tsx`:

- `memo()` wrapper
- Dos paneles: input + output
- `ExpandedEditorModal` para ambos
- `ValidationStatus` + `Stats` + `OutputStatus`

### 6c. Playground (`src/playgrounds/<lang>/<Lang>Playground.tsx`)

Sigue el patrón de `CssPlayground.tsx`:

- Estado: input, output, error, formatConfig, minifyConfig
- Hooks: `useModalState`, `usePlaygroundInputLifecycle`, `use<Lang>Parser`, `use<Lang>PlaygroundActions`, `usePlaygroundShortcuts`
- Layout: `PlaygroundLayout` con `<Lang>Editors` + `Toolbar` (variant `\"generic\"`, con `extraContent` si necesita UI adicional)

### 6d. Index (`src/playgrounds/<lang>/index.ts`)

```ts
export { <Lang>Playground } from "./<Lang>Playground";
export { <lang>PlaygroundConfig } from "./<lang>.config";
```

---

## Paso 7 — Registro

Agregar el playground en `src/playgrounds/registry.ts`:

1. Importar el config
2. Agregar loader lazy
3. Agregar entrada en `playgroundLoaders`
4. Agregar entrada en `playgroundRegistry`

Agregar ruta en `src/pages/PlaygroundPage.tsx` si es necesario (normalmente se resuelve por la ruta dinámica `/playground/:playgroundId`).

---

## Paso 8 — Tests obligatorios

Crear todos los tests requeridos por la matriz (ver `docs/TESTING_MATRIX.md`):

| Archivo                              | Ubicación                 |
| ------------------------------------ | ------------------------- |
| `transform.test.ts`                  | `src/services/<lang>/`    |
| `worker.test.ts`                     | `src/services/<lang>/`    |
| `workerClient.test.ts`               | `src/services/<lang>/`    |
| `<Lang>Playground.test.tsx`          | `src/playgrounds/<lang>/` |
| `<Lang>Playground.branches.test.tsx` | `src/playgrounds/<lang>/` |
| `<Lang>Editors.test.tsx`             | `src/playgrounds/<lang>/` |
| `use<Lang>Parser.test.ts`            | `src/hooks/`              |
| `<lang>-workflow.spec.ts`            | `e2e/`                    |

---

## Paso 9 — Verificación final

```bash
# Verificar archivos requeridos
pnpm verify:arch

# Ejecutar tests unitarios
pnpm test

# Ejecutar lint
pnpm lint

# Ejecutar E2E
pnpm e2e

# Build de producción
pnpm build
```

---

## Checklist rápido

- [ ] `src/types/<lang>.ts` — tipos y defaults
- [ ] `src/services/<lang>/transform.ts` — funciones puras
- [ ] `src/services/<lang>/transform.test.ts`
- [ ] `src/services/<lang>/worker.types.ts`
- [ ] `src/services/<lang>/workerClient.ts`
- [ ] `src/services/<lang>/workerClient.test.ts`
- [ ] `src/services/<lang>/worker.ts`
- [ ] `src/services/<lang>/worker.test.ts`
- [ ] `src/services/<lang>/service.ts`
- [ ] `src/workers/<lang>Worker.ts`
- [ ] `src/services/storage.ts` — persistencia
- [ ] `src/hooks/use<Lang>Parser.ts` + test
- [ ] `src/hooks/use<Lang>PlaygroundActions.ts`
- [ ] `src/playgrounds/<lang>/<lang>.config.ts`
- [ ] `src/playgrounds/<lang>/<Lang>Editors.tsx`
- [ ] `src/playgrounds/<lang>/<Lang>Editors.test.tsx`
- [ ] `src/playgrounds/<lang>/<Lang>Playground.tsx`
- [ ] `src/playgrounds/<lang>/<Lang>Playground.test.tsx`
- [ ] `src/playgrounds/<lang>/<Lang>Playground.branches.test.tsx`
- [ ] `src/playgrounds/<lang>/index.ts`
- [ ] `src/playgrounds/registry.ts` — registro
- [ ] `e2e/<lang>-workflow.spec.ts`
- [ ] `scripts/verify-architecture.js` — agregar nuevo lang al array `PLAYGROUNDS`
- [ ] `pnpm verify:arch` pasa
- [ ] `pnpm test` pasa
- [ ] `pnpm lint` pasa
- [ ] `pnpm build` pasa

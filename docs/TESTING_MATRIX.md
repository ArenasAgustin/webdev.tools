# Testing Matrix — Mínimo Obligatorio por Playground

Este documento define la matriz de testing unificada para todos los playgrounds.
Cualquier nuevo playground debe cumplir con estos mínimos antes de considerarse completo.

---

## 1) Unit Tests — Servicios

Cada playground debe tener tests unitarios para sus servicios en `src/services/<lang>/`:

| Archivo                | Descripción                                 | Obligatorio |
| ---------------------- | ------------------------------------------- | ----------- |
| `transform.test.ts`    | Funciones puras: format, minify, parse, etc | ✅ Sí       |
| `worker.test.ts`       | Orquestación async con fallback a sync      | ✅ Sí       |
| `workerClient.test.ts` | Cliente del worker (creación, reuso, error) | ✅ Sí       |

Los tests de worker y workerClient usan los harness compartidos en `src/test/workerHarness.ts`:

- `defineWorkerServiceTests` — para `worker.test.ts`
- `defineWorkerClientTests` — para `workerClient.test.ts`

### Tests de dominio específico

Si el playground tiene lógica extra (ej. JSONPath, ejecución JS), se agrega un test adicional:

- `jsonPath.test.ts` (JSON)

---

## 2) Unit Tests — Hooks

Hooks críticos que deben tener tests propios:

| Hook                        | Playground | Obligatorio                                     |
| --------------------------- | ---------- | ----------------------------------------------- |
| `use*PlaygroundActions.ts`  | Todos      | ✅ Cubierto por `*Playground.branches.test.tsx` |
| `use*Parser.ts` / validator | Todos      | ✅ Sí                                           |

Hooks compartidos con test propio obligatorio:

- `useModalState`
- `useTextStats`
- `useToast`
- `useFocusTrap`
- `useExpandedEditor`

Hooks compartidos cubiertos por integración (no requieren test unitario propio):

- `usePlaygroundShortcuts` (wrapper delgado)
- `useMergedConfigState` (wrapper delgado)
- `useDebouncedValue` (patrón trivial)
- `useTransformActions` (composición delegada)
- `useDocumentMeta` (efecto secundario controlado)
- `usePlaygroundInputLifecycle` (composición delegada)

---

## 3) Tests de Integración — Playgrounds

Cada playground en `src/playgrounds/<lang>/` debe tener:

| Archivo                         | Qué prueba                                    | Obligatorio |
| ------------------------------- | --------------------------------------------- | ----------- |
| `*Playground.test.tsx`          | Render por defecto + flujo format/minify      | ✅ Sí       |
| `*Playground.branches.test.tsx` | Branches: copy, download, error, config, size | ✅ Sí       |
| `*Editors.test.tsx`             | Editores: render, interacción, props          | ✅ Sí       |

### Patrón obligatorio para `*Playground.test.tsx`

```tsx
// Mock LazyCodeEditor como textarea
// Mock localStorage
// Tests mínimos:
// 1. "renders the example by default" — verifica contenido ejemplo
// 2. "formats and minifies input" — verifica flujo feliz
```

### Patrón obligatorio para `*Playground.branches.test.tsx`

```tsx
// Mock de todos los servicios y dependencias
// Tests mínimos:
// 1. copy/download con input vacío → toast error
// 2. format/minify/clean → success + error flows
// 3. autoCopy branching
// 4. input > MAX_INPUT_BYTES → guard activo
```

---

## 4) Tests E2E

Cada playground debe tener un spec en `e2e/`:

| Archivo                   | Qué prueba                                       | Obligatorio |
| ------------------------- | ------------------------------------------------ | ----------- |
| `<lang>-workflow.spec.ts` | Workflow feliz: format + minify + acciones extra | ✅ Sí       |

### Flujo mínimo por E2E

1. Navegar al playground
2. Ingresar input
3. Formatear → verificar output
4. Minificar → verificar output
5. Configuración: cambiar opción → verificar persistencia al recargar

### E2E compartidos obligatorios

| Archivo                     | Qué prueba                          |
| --------------------------- | ----------------------------------- |
| `smoke.spec.ts`             | Home + accesibilidad de playgrounds |
| `cross-playground.spec.ts`  | Navegación entre playgrounds        |
| `error-edge.spec.ts`        | Límites de tamaño, loops, errores   |
| `responsive-mobile.spec.ts` | Viewport móvil (375px)              |

---

## 5) Matriz de Cumplimiento Actual

| Playground | transform | worker | workerClient | Playground.test | branches.test | Editors.test | E2E workflow |
| ---------- | --------- | ------ | ------------ | --------------- | ------------- | ------------ | ------------ |
| **CSS**    | ✅        | ✅     | ✅           | ✅              | ✅            | ✅           | ✅           |
| **HTML**   | ✅        | ✅     | ✅           | ✅              | ✅            | ✅           | ✅           |
| **JS**     | ✅        | ✅     | ✅           | ✅              | ✅            | ✅           | ✅           |
| **JSON**   | ✅        | ✅     | ✅           | ✅              | ✅            | ✅           | ✅           |

---

## 6) Checklist para Nuevos Playgrounds

Antes de mergear un nuevo playground, verificar:

- [ ] `src/services/<lang>/transform.test.ts` existe y pasa
- [ ] `src/services/<lang>/worker.test.ts` existe y pasa
- [ ] `src/services/<lang>/workerClient.test.ts` existe y pasa
- [ ] `src/playgrounds/<lang>/*Playground.test.tsx` existe y pasa
- [ ] `src/playgrounds/<lang>/*Playground.branches.test.tsx` existe y pasa
- [ ] `src/playgrounds/<lang>/*Editors.test.tsx` existe y pasa
- [ ] `e2e/<lang>-workflow.spec.ts` existe y pasa
- [ ] Hook parser/validator tiene test propio
- [ ] Todas las acciones de toolbar tienen cobertura en branches test

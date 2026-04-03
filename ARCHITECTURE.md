# 🏗️ Arquitectura & Stack Tecnológico

Este documento describe la arquitectura, las decisiones técnicas y las tecnologías
utilizadas en el proyecto **webdev.tools**, una aplicación web 100% client-side
orientada a desarrolladores con playgrounds para CSS, HTML, JavaScript y JSON.

---

## 🎯 Objetivos técnicos

- Aplicación rápida y liviana
- 100% client-side (sin backend)
- Código tipado, modular y mantenible
- Arquitectura escalable a múltiples playgrounds
- Separación clara entre UI y lógica de negocio

---

## 🧱 Stack Tecnológico

### Frontend

- **React 19**
  - Renderizado de UI
  - Composición por componentes
- **TypeScript**
  - Tipado estricto
  - Mayor mantenibilidad y refactor seguro
- **Vite**
  - Dev server rápido
  - Build optimizado

---

### UI & UX

- **Monaco Editor**
  - Editor de código profesional
  - Syntax highlight, folding, validation
- **Tailwind CSS**
  - Estilos utilitarios
  - Diseño consistente y rápido
- **Dark Mode**
  - Soporte desde el inicio

---

### JSON & Processing

- **JSON nativo (JavaScript)**
  - Parseo
  - Validación
  - Serialización
- **jsonpath-plus**
  - Filtros JSONPath
  - Consultas avanzadas sobre JSON

---

### Estado

- **React hooks**
  - Estado local

---

### Persistencia

- **localStorage**
  - Último JSON / JS
  - Preferencias

---

## 🧠 Principios de arquitectura

- **Feature-first**
- **Unidirectional data flow**
- **UI ≠ lógica**
- **Lógica pura y testeable**
- **Escalabilidad sin refactor**

---

## 📁 Estructura de carpetas

```txt
src/
├── App.tsx
├── main.tsx
├── app/                    # assets y componentes base de app
├── components/             # UI reusable (common/editor/layout)
├── hooks/                  # hooks de estado y acciones
├── pages/                  # Home / PlaygroundPage
├── playgrounds/            # CSS, HTML, JS, JSON playgrounds + registry
│   ├── css/                # css.config.ts, CssPlayground.tsx, CssEditors.tsx, tests
│   ├── html/               # html.config.ts, HtmlPlayground.tsx, HtmlEditors.tsx, tests
│   ├── js/                 # js.config.ts, JsPlayground.tsx, JsEditors.tsx, tests
│   ├── json/               # json.config.ts, JsonPlayground.tsx, JsonEditors.tsx, tests
│   └── registry.ts         # registro central de playgrounds
├── services/
│   ├── css/                # service.ts, transform.ts, worker.ts, workerClient.ts, worker.types.ts
│   ├── html/               # (misma estructura)
│   ├── js/                 # (misma estructura)
│   ├── json/               # (misma estructura) + jsonPath.ts
│   ├── formatter/          # prettier.ts (integración compartida con Prettier)
│   ├── worker/             # adapter.ts, clientFactory.ts, runtime.ts, types.ts
│   ├── storage.ts          # persistencia en localStorage
│   └── transform.ts        # contratos compartidos de transformación
├── workers/                # web workers (cssWorker, htmlWorker, jsWorker, jsonWorker)
├── test/                   # harnesses compartidos (workerHarness.ts)
├── context/                # Toast context
├── types/                  # contratos compartidos (common, config, css, html, js, json, format, toolbar, playground)
└── utils/                  # helpers (handlerFactory, transformError, download, constants)
```

---

## 🔄 Flujo de datos

```txt
CodeEditor (input)
   ↓
State local (hooks)
   ↓
Services (parse / format / filter)
   ↓
Workers (cuando aplica)
   ↓
Hooks / Actions
   ↓
CodeEditor (output)
```

### Características del flujo

- **Flujo unidireccional**
- **Sin mutaciones directas del input**
- **Output siempre derivado**

---

## 🧪 Servicios (Core lógico)

Los servicios:

- **No dependen de React**
- **No manejan estado**
- **Son fácilmente testeables**

**Ejemplo:**

```typescript
parseJson(input: string): Result<JsonValue, JsonError>
```

### Estructura uniforme por playground

Cada playground en `src/services/<lang>/` sigue esta estructura:

| Archivo           | Responsabilidad                                  |
| ----------------- | ------------------------------------------------ |
| `transform.ts`    | Funciones puras: format, minify, parse, validate |
| `worker.ts`       | Orquestación async con fallback a sync           |
| `workerClient.ts` | Cliente del web worker                           |
| `worker.types.ts` | Tipos del worker                                 |
| `service.ts`      | Facade pública (PlaygroundTransformService)      |

El formateo usa `src/services/formatter/prettier.ts` — cada `transform.ts` lo importa directamente.
La infraestructura de workers está compartida en `src/services/worker/` (adapter, runtime, types).

---

## 🧩 Componentes clave

### CodeEditor

Wrapper genérico de Monaco Editor.

```typescript
type CodeEditorProps = {
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
};
```

**Reutilizable para todos los playgrounds.**

---

## 🧠 Tipos principales

```typescript
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

---

## 🚀 Escalabilidad

Para agregar un nuevo playground:

```txt
playgrounds/sql/
playgrounds/markdown/
```

Ver `docs/CONTRIBUTING_PLAYGROUND.md` para guía paso a paso.

**Playgrounds implementados:** CSS, HTML, JavaScript, JSON.

**Ventajas:**

- Se reutiliza UI (PlaygroundLayout, Panel, Toolbar, InputActions, OutputActions)
- Se reutiliza CodeEditor (LazyCodeEditor sobre Monaco)
- Se reutilizan hooks base (usePlaygroundActions, useTransformActions, usePlaygroundInputLifecycle, usePlaygroundShortcuts)
- No se refactoriza código existente

---

## 🧠 Regla de oro

> **Si mañana React desaparece, la lógica del proyecto sigue funcionando.**

---

## 📌 Decisiones clave

- Monaco Editor como editor central (cargado lazy via LazyCodeEditor)
- TypeScript estricto
- Client-side only
- Arquitectura modular y escalable
- Workers con fallback a sync para inputs grandes
- Prettier compartido para format (CSS/HTML/JS); JSON usa JSON.stringify nativo
- `compactTransformError` unificado para manejo de errores en todos los playgrounds

---

## 📐 Contrato de Playground

El contrato técnico obligatorio para todos los playgrounds está definido en:

- `docs/PLAYGROUND_CONTRACT.md` — Estado mínimo, hooks, acciones, persistencia, atajos
- `docs/TESTING_MATRIX.md` — Matriz mínima de testing por playground
- `docs/CONTRIBUTING_PLAYGROUND.md` — Guía paso a paso para nuevos playgrounds

---

## ✅ Checklist de verificación post-cambios

Después de **cualquier cambio** al proyecto (bug fix, refactor, nueva feature), ejecutar en este orden:

```bash
# 1. Lint — estilo y reglas de código
pnpm lint

# 2. TypeScript — compilación sin errores
pnpm build

# 3. Tests unitarios e integración
pnpm test

# 4. Tests e2e (requiere build previo)
pnpm e2e

# 5. Verificación arquitectónica (archivos requeridos, naming, registro)
pnpm verify:arch
```

> **Regla:** ningún cambio se considera completo hasta que los 5 pasos pasen sin errores.

---

## 📈 Futuro

Ver `docs/ROADMAP.md` para el plan de desarrollo completo

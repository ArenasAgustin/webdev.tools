# 🏗️ Arquitectura & Stack Tecnológico

Este documento describe la arquitectura, las decisiones técnicas y las tecnologías
utilizadas en el proyecto **JSON Tools / Code Playground**, una aplicación web
100% client-side orientada a desarrolladores.

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
├── playgrounds/            # JSON y JS playgrounds + registry
├── services/               # lógica framework-agnostic
│   ├── formatter/          # formatter.ts (JSON/JS) + prettier.ts
│   ├── minifier/           # minifier.ts (JSON/JS)
│   ├── json/               # parse/minify/clean/jsonPath
│   ├── js/                 # minify + worker adapters
│   ├── worker/             # runtime/shared worker infra
│   └── storage.ts
├── workers/                # web workers (jsonWorker/jsWorker)
├── context/                # Toast context
├── types/                  # contratos compartidos (json/js/format/toolbar)
└── utils/                  # helpers utilitarios
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

### Actualización (2026-02)

- El formateo de JSON/JS está centralizado en `src/services/formatter/formatter.ts`.
- `src/services/formatter/prettier.ts` encapsula integración con Prettier (parser/plugins/indentación tabs/espacios).
- Workers y servicios de playground consumen el módulo compartido para evitar duplicación y asegurar comportamiento consistente.

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
playgrounds/js/
playgrounds/html/
playgrounds/css/
playgrounds/php/
```

**Ventajas:**

- Se reutiliza UI
- Se reutiliza CodeEditor
- Se reutilizan hooks base
- No se refactoriza código existente

---

## 🧠 Regla de oro

> **Si mañana React desaparece, la lógica del proyecto sigue funcionando.**

---

## 📌 Decisiones clave

- Monaco Editor como editor central
- TypeScript estricto
- Client-side only
- Arquitectura modular y escalable

---

## 📈 Futuro (no implementado aún)

- JSON Schema validation
- jq via WebAssembly
- Export / share por URL
- PWA
- Playground multi-tab

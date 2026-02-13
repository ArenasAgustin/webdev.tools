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

- **React 18**
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
- **Zustand**
  - Estado global liviano
  - Sin boilerplate

---

### Persistencia

- **localStorage**
  - Último JSON
  - Preferencias
- **IndexedDB**
  - Historial
  - Datos grandes

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
├── app/                    # Bootstrap de la aplicación
│   ├── App.tsx
│   ├── routes.tsx          # (futuro)
│   └── providers.tsx
│
├── playgrounds/            # Playgrounds por tecnología
│   └── json/
│       ├── JsonPlayground.tsx
│       ├── JsonToolbar.tsx
│       ├── JsonEditors.tsx
│       ├── JsonPathPanel.tsx
│       ├── json.config.ts
│       ├── json.types.ts
│       └── json.constants.ts
│
├── components/             # UI reutilizable
│   ├── editor/
│   │   ├── CodeEditor.tsx
│   │   └── EditorStatus.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Panel.tsx
│   │   └── SplitView.tsx
│   └── common/
│
├── hooks/                  # Lógica React reutilizable
│   ├── useJsonParser.ts
│   ├── useJsonFormatter.ts
│   ├── useJsonPath.ts
│   ├── useClipboard.ts
│   └── useLocalStorage.ts
│
├── services/               # Lógica pura (framework-agnostic)
│   └── json/
│       ├── parse.ts
│       ├── format.ts
│       ├── minify.ts
│       ├── clean.ts
│       └── jsonPath.ts
│
├── store/                  # Estado global
│   ├── json.store.ts
│   └── ui.store.ts
│
├── styles/
│   └── globals.css
│
├── types/
│   ├── common.ts
│   └── playground.ts
│
├── utils/
│   ├── errors.ts
│   ├── guards.ts
│   └── debounce.ts
│
└── main.tsx
```

---

## 🔄 Flujo de datos

```txt
CodeEditor (input)
   ↓
Store / State
   ↓
Services (parse / format / filter)
   ↓
Hooks
   ↓
Store / State
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

# 🤖 AI Context – Project Specification

This document defines the **technical context, architecture, constraints and rules**
for any AI system assisting with this project.

Any suggestion, code, refactor or implementation MUST follow this document.
If a suggestion conflicts with this document, it MUST be discarded.

---

## 1. Project Overview

**Project type:** Web application  
**Execution:** 100% client-side  
**Target users:** Developers  
**Primary purpose:** Provide developer tools for multiple languages: JSON, JavaScript, HTML and CSS.
Future languages (SQL, PHP, etc.) follow the same playground architecture.

This project is NOT a demo or tutorial. It is designed as a maintainable,
scalable developer tool with 4 fully implemented playgrounds.

---

## 2. Fixed Technology Stack (non-negotiable)

The following technologies are **mandatory**:

- React 19
- TypeScript (strict typing)
- Vite
- Monaco Editor
- Tailwind CSS
- Native JavaScript JSON API
- jsonpath-plus

### Explicit exclusions

Do NOT suggest or introduce:

- Backend or server-side code
- Frameworks like Next.js, Astro, Vue, Svelte
- State managers heavier than Zustand or React Context
- Any technology not listed above without explicit user request

`new Function` is allowed only in the JavaScript playground execution flow, with the existing in-browser constraints.

---

## 3. Architecture Principles

- Feature-first organization
- Clear separation of concerns
- UI components MUST NOT contain business logic
- Business logic MUST be pure and framework-agnostic
- Unidirectional data flow
- Output data is always derived, never mutated directly

---

## 4. Project Structure (canonical)

```txt
src/
├── app/
├── components/              # UI reusable (common/editor/layout)
├── context/                 # Toast context
├── hooks/                   # hooks de estado y acciones
├── pages/                   # Home / PlaygroundPage
├── playgrounds/             # css/ html/ js/ json/ + registry.ts
├── services/
│   ├── css/                 # service + transform + worker
│   ├── html/                # service + transform + worker
│   ├── js/                  # service + transform + worker
│   ├── json/                # service + transform + worker + jsonPath
│   ├── formatter/           # prettier.ts (shared Prettier integration)
│   ├── worker/              # shared runtime/adapter/types
│   ├── storage.ts           # localStorage persistence
│   └── transform.ts         # shared transform contracts
├── workers/                 # web workers (cssWorker/htmlWorker/jsWorker/jsonWorker)
├── test/                    # shared test harnesses
├── types/                   # shared types (common/config/css/html/js/json/format/toolbar)
├── utils/                   # helpers (handlerFactory, transformError, download, constants)
├── App.tsx
└── main.tsx
```

This structure MUST be preserved.

---

## 5. Implemented Playgrounds

### CSS Playground

- CSS validation, formatting (Prettier), minification

### HTML Playground

- HTML validation, formatting (Prettier), minification, live preview

### JavaScript Playground

- JS validation, formatting (Prettier), minification (Terser), in-browser execution with timeout

### JSON Playground

- JSON validation, formatting, minification, cleaning (empty/null removal), JSONPath filtering with history

### Out of scope (do NOT implement)

- JSON Schema validation
- jq or WebAssembly tools
- Authentication
- Backend APIs
- Data persistence beyond local browser storage

---

## 6. Business Logic Rules

Each playground's operations live in `services/<lang>/` with a unified structure:
`transform.ts` (pure functions), `worker.ts` (async orchestration), `workerClient.ts` (worker communication), `service.ts` (facade).

Formatting uses `services/formatter/prettier.ts` — each `transform.ts` imports it directly.

Services must:

- Be pure functions
- Have no side effects
- Be independently testable

Errors must be returned as typed results, not thrown unless unavoidable.

### Preferred error pattern

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

---

## 7. TypeScript Rules

- `any` is **forbidden**
- Prefer `unknown` with proper type guards
- All public functions must have **explicit return types**
- Domain types must be defined in `types/` or feature-specific type files

---

## 8. UI Rules

- UI components are **presentation-only**
- No `alert()`
- Errors must be shown **inline**
- Empty and loading states must be **explicit**
- Dark mode must be **respected**

---

## 9. AI Behavior Rules

### An AI assisting this project MUST

- Follow this document strictly
- Propose solutions aligned with the existing architecture
- Prefer simple, explicit implementations
- Ask for confirmation ONLY if a decision contradicts this document

### An AI assisting this project MUST NOT

- Change the technology stack
- Introduce architectural patterns not described here
- Add unnecessary dependencies
- Mix UI and business logic
- Refactor without a clear architectural benefit

---

## 10. Reference Files

- `docs/ROADMAP.md` → Development plan
- `docs/ARCHITECTURE.md` → Detailed architecture & post-change checklist
- `docs/AI_CONTEXT.md` → This document
- `docs/PLAYGROUND_CONTRACT.md` → Mandatory contract per playground
- `docs/TESTING_MATRIX.md` → Minimum testing requirements
- `docs/CONTRIBUTING_PLAYGROUND.md` → Step-by-step guide for new playgrounds

---

## 11. Final Rule

**If an AI-generated suggestion violates any rule in this document,
it must be considered invalid and ignored.**

---

## 🧠 Por qué esta versión funciona con _cualquier_ IA

- Lenguaje **imperativo y normativo**
- Nada de "yo", "nosotros", "podrías"
- Reglas explícitas
- Stack cerrado
- Arquitectura canónica

Este archivo es básicamente un **contrato técnico para IAs**.

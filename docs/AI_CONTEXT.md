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
**Primary purpose:** Provide tools to work with JSON and, in the future, other
languages (JavaScript, HTML, CSS, PHP).

This project is NOT a demo or tutorial. It is designed as a maintainable,
scalable developer tool.

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
├── components/
├── context/
├── hooks/
├── pages/
├── playgrounds/
├── services/
│   ├── format/             # formatter.ts + prettier.ts
│   ├── json/
│   ├── js/
│   └── worker/
├── workers/
├── test/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

This structure MUST be preserved.

---

## 5. JSON Playground – Current Scope

### Allowed functionality

- JSON validation
- JSON formatting
- JSON minification
- JSONPath filtering

### Out of scope (do NOT implement)

- JSON Schema validation
- jq or WebAssembly tools
- Authentication
- Backend APIs
- Data persistence beyond local browser storage

---

## 6. Business Logic Rules

JSON operations must live in `services/json/`.
Formatting operations for JSON/JS must be centralized in `services/format/formatter.ts`.

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
- `docs/ARCHITECTURE.md` → Detailed architecture
- `docs/AI_CONTEXT.md` → This document

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

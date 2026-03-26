# AGENTS.md — webdev.tools

This file is the **authoritative guide for AI agents** working on this project.
All suggestions, code, refactors, and implementations MUST follow these rules.
If a suggestion conflicts with this document, it is invalid.

For deeper context, read `docs/AI_CONTEXT.md` and `docs/ARCHITECTURE.md`.

---

## Project Overview

**webdev.tools** is a 100% client-side SPA for developers.
It provides code playgrounds for multiple languages: JSON, JavaScript, HTML, CSS.
There is no backend. All processing runs in the browser via Web Workers.

---

## Mandatory Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | React 19 + React Router 7                    |
| Language        | TypeScript strict                            |
| Build           | Vite (rolldown-vite)                         |
| Editor          | Monaco Editor                                |
| Styling         | Tailwind CSS 3                               |
| Testing         | Vitest + @testing-library/react + Playwright |
| Package manager | pnpm                                         |

**Never introduce:** Next.js, Astro, Vue, Svelte, any backend, any state manager heavier than React Context.

---

## Architecture Rules

- **Feature-first structure** — each playground is self-contained under `src/playgrounds/<lang>/`
- **UI is presentation-only** — no business logic in components
- **Services are pure functions** — no side effects, independently testable
- **Unidirectional data flow** — input → state → service → output, never the other way
- **"If React disappears tomorrow, the logic still works"** — the golden rule

### Service layer structure (mandatory per playground)

```
src/services/<lang>/
  service.ts        # public facade
  transform.ts      # pure functions (format, minify, parse, validate)
  transform.test.ts # unit tests for all pure functions
  worker.ts         # async orchestration with fallback
  worker.types.ts   # worker message types
  workerClient.ts   # worker communication client
```

---

## TypeScript Rules

- `any` is **forbidden** — use `unknown` with type guards
- All public functions must have **explicit return types**
- Prefer the `Result<T, E>` pattern over throwing:

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

---

## Adding a New Playground

Read `docs/CONTRIBUTING_PLAYGROUND.md` before touching anything.
Every playground must implement the contract in `docs/PLAYGROUND_CONTRACT.md`.
Run `pnpm verify:arch` after adding any playground — it enforces the contract.

---

## CI/CD

The following scripts must pass before any commit:

```bash
pnpm typecheck      # tsc -b
pnpm lint           # ESLint
pnpm test:coverage  # Vitest with coverage thresholds
pnpm verify:arch    # architectural contract check
```

E2E tests run separately (require a build):

```bash
pnpm build && pnpm e2e
```

GitHub Actions runs `ci.yml` (fast quality gate) on every push to main.
`e2e.yml` runs Playwright + uploads bundle stats artifact.

---

## Commit Conventions

Conventional commits only. No AI attribution in commit messages.

```
feat: add X
fix: correct Y
refactor: simplify Z
test: add coverage for W
chore: update config
```

---

## What NOT to Do

- Do not add backend code, APIs, or server-side rendering
- Do not introduce new dependencies without a clear reason
- Do not mix UI and business logic
- Do not use `any` in TypeScript
- Do not refactor code outside the scope of the current task
- Do not add comments that just restate what the code does
- Do not skip `pnpm verify:arch` after structural changes
- Do not add `Co-Authored-By` or AI attribution to commits

---

## Key Reference Files

| File                              | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `docs/AI_CONTEXT.md`              | Full technical rules and constraints     |
| `docs/ARCHITECTURE.md`            | Architecture decisions and stack details |
| `docs/ROADMAP.md`                 | Development phases and current status    |
| `docs/PLAYGROUND_CONTRACT.md`     | Mandatory interface per playground       |
| `docs/TESTING_MATRIX.md`          | Minimum test requirements per playground |
| `docs/CONTRIBUTING_PLAYGROUND.md` | Step-by-step guide for new playgrounds   |

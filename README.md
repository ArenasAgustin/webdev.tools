# webdev.tools

Herramienta web client-side para desarrolladores con playgrounds de JSON y JavaScript.

## Stack

- React 19
- TypeScript (strict)
- Vite
- Monaco Editor
- Tailwind CSS
- Vitest

## Scripts

- `pnpm dev` → entorno local
- `pnpm build` → build producción
- `pnpm test` → tests
- `pnpm test:coverage` → cobertura
- `pnpm lint` / `pnpm lint:fix`
- `pnpm storybook` / `pnpm build-storybook`

## Arquitectura (resumen)

- UI en `src/components` y `src/playgrounds`
- Lógica reusable en `src/hooks`
- Servicios puros en `src/services`
- Workers en `src/workers`

### Formateo centralizado

El formateo de JSON y JS está centralizado en:

- `src/services/format/formatter.ts`

Integración con Prettier aislada en:

- `src/services/format/prettier.ts`

Esto evita duplicación entre playgrounds y asegura comportamiento consistente (espacios/tabs, parser y normalización de output).

## Documentación interna

- `docs/ROADMAP.md` → plan y estado
- `docs/ARCHITECTURE.md` → decisiones y estructura técnica
- `docs/AI_CONTEXT.md` → reglas para asistentes IA

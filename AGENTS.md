# AGENTS.md — webdev.tools

Instrucciones específicas para este proyecto. Se suman a las reglas globales de `~/.claude/CLAUDE.md`.

---

## OpenCode Commands

Este proyecto usa SDD (Spec-Driven Development) para cambios no triviales:

| Comando                | Descripción                                     |
| ---------------------- | ----------------------------------------------- |
| `/sdd-init`            | Inicializar contexto SDD en el proyecto         |
| `/sdd-explore <topic>` | Investigar algo antes de implementar            |
| `/sdd-new <name>`      | Crear nuevo cambio (explore + propose)          |
| `/sdd-continue`        | Continuar siguiente fase del SDD activo         |
| `/sdd-ff`              | Fast-forward: proposal → specs → design → tasks |

**Para cambios simples** (fixes, refactors pequeños): trabajá directamente sin SDD.

**Para cambios complejos** (nuevas features, refactors grandes): usá SDD obligatoriamente.

---

## Workflow

### Antes de cada commit

Corré la suite completa. Si alguno falla, corregí antes de seguir:

```bash
pnpm typecheck
pnpm lint
pnpm test:coverage --run
pnpm verify:arch
```

**Nunca hagas un commit sin preguntarle al usuario primero.** Sin excepciones.

---

## Testing

- **Unit tests:** `pnpm test --run`
- **Con coverage:** `pnpm test:coverage --run`
- **E2E:** `pnpm build && pnpm e2e` (requiere build previo)

Los tests flaky de IndexedDB en CI son conocidos — si fallan solo en CI pero local pasan, puede ser timing. Verificá con `pnpm test:coverage --run` varias veces.

---

## Roadmap

Siempre mantené `docs/ROADMAP.md` actualizado cuando se completa o inicia una fase.

---

## Idioma

Respondé siempre en español. Usá voseo: "che", "dale", "mirá", "buenísimo", "locura".

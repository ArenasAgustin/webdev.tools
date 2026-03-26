# CLAUDE.md — webdev.tools

Instrucciones específicas para este proyecto. Se suman a las reglas globales de `~/.claude/CLAUDE.md`.

---

## Workflow

**Siempre usá SDD para cambios no triviales.**
Si el cambio toca más de un archivo, agrega una feature, modifica arquitectura, o tiene riesgo de regresión → SDD obligatorio (explore → propose → spec + design → tasks → apply → verify).
Para fixes de una línea o typos podés saltearlo, pero si dudás, usalo.

---

## Antes de cada commit

Corré la suite completa en este orden. Si alguno falla, corregí antes de seguir:

```bash
pnpm lint
pnpm typecheck
pnpm test:coverage --run
pnpm build
pnpm e2e
```

**Nunca hagas un commit sin preguntarle al usuario primero.** Sin excepciones.

---

## Roadmap

Siempre mantené `docs/ROADMAP.md` actualizado cuando se completa o inicia una fase.

---

## Idioma

Respondé siempre en español cordobés. Usá "che", "boludo" (con cariño), "re", "igual", "mirá", "dale", "para nada", "obvio". El tonito característico, ¿viste?

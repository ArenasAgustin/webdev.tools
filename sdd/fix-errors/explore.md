# Exploration: fix-errors

## Current State

### Registry Structure

El registry actual tiene este orden:

1. JSON
2. JS
3. HTML
4. CSS
5. Colors
6. **Hash** ← a eliminar
7. **Password** ← a eliminar
8. Timestamp
9. PHP ← mover después de Colors

### Hash Playground

- MD5 está deshabilitado (solo devuelve "No disponible")
- Archivos: `hash.config.ts`, `HashPlayground.tsx`, `hash.utils.ts`, `hash.utils.test.ts`
- El usuario indica que MD5 no funciona, entonces quiere remover todo el playground de hash

### Password Playground

- Archivos: `password.config.ts`, `PasswordPlayground.tsx`, `password.utils.ts`, `password.utils.test.ts`
- El usuario quiere eliminarlo completamente

### Tests

- Todos los tests pasan actualmente ✓
- No hay failures

## Affected Areas

| File                          | Action                                    |
| ----------------------------- | ----------------------------------------- |
| `src/playgrounds/registry.ts` | Remove hash/password entries, reorder PHP |
| `src/playgrounds/hash/*`      | Delete all 4 files                        |
| `src/playgrounds/password/*`  | Delete all 4 files                        |

## Approach

### Recommended: Direct Implementation

Simple y directo - eliminar archivos y actualizar registry en un paso.

**Effort: Low**

### Risks

- Que haya referencias a estos playgounds en otros lugares (navigation, routes, etc.)
- Tests que importen los archivos eliminados

## Ready for Proposal

**Yes** - El cambio es claro y directo. No hay decisiones arquitectónicas complejas.

## Summary

- Eliminar hash playground (MD5 no funciona)
- Eliminar password playground
- Mover PHP después de Colors (antes de timestamp)
- Todos los tests pasan actualmente, verificar que no rompan después de los cambios

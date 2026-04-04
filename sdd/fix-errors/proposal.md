# Proposal: fix-errors

## Intent

Remover playgrounds de Hash y Password que no funcionan correctamente (MD5 no está disponible en hash), y reordernar PHP para que aparezca después de Colors en el registry.

## Scope

### In Scope

- Eliminar Hash playground del registry y borrar archivos relacionados
- Eliminar Password playground del registry y borrar archivos relacionados
- Reordenar PHP para aparecer después de Colors
- Verificar que los tests pasen después de los cambios

### Out of Scope

- Nuevas features
- Refactors de otros playgrounds

## Approach

Eliminación directa de archivos y actualización del registry. Cambio simple que no requiere diseño arquitectónico complejo.

## Affected Areas

| Area                          | Impact   | Description                                            |
| ----------------------------- | -------- | ------------------------------------------------------ |
| `src/playgrounds/registry.ts` | Modified | Remove hash/password entries, reorder PHP after Colors |
| `src/playgrounds/hash/*`      | Removed  | Delete 4 files (config, playground, utils, test)       |
| `src/playgrounds/password/*`  | Removed  | Delete 4 files (config, playground, utils, test)       |

## Risks

| Risk                                   | Likelihood | Mitigation                                     |
| -------------------------------------- | ---------- | ---------------------------------------------- |
| Referencias rotas en navigation/routes | Low        | Verificar que no haya imports en otros lugares |
| Tests fallando después de eliminación  | Low        | Ejecutar suite completa post-cambio            |

## Rollback Plan

1. Restaurar archivos eliminados desde git
2. Restaurar registry.ts a estado anterior
3. Ejecutar tests para verificar

## Dependencies

- Ninguna dependencia externa

## Success Criteria

- [ ] Hash playground eliminado del registry y archivos borrados
- [ ] Password playground eliminado del registry y archivos borrados
- [ ] PHP aparece después de Colors en el registry
- [ ] `pnpm test:coverage --run` pasa sin errores
- [ ] `pnpm typecheck` pasa sin errores

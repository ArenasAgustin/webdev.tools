# Proposal: minify-button-optional

## Intent

El botón de minify se muestra en todos los playgrounds pero PHP no tiene implementación de minify, lo que genera confusión al usuario. El objetivo es hacer que el botón sea condicional basándose en features del engine.

## Scope

### In Scope

- Modificar `PlaygroundFeature` type para incluir "minify" como feature válido
- Modificar `GenericPlayground` para verificar si el engine tiene feature "minify" antes de mostrar el botón
- Agregar feature "minify" a engines existentes (json, js, html, css)
- PHP engine ya tiene solo "validate", no debe agregar minify (fuera de scope implementar)

### Out of Scope

- Implementar minify para PHP (el usuario explicitly no lo quiere)
- Modificar otros features existentes

## Capabilities

### Modified Capabilities

- `generic-playground-toolbar`: El toolbar de cada playground deberá mostrar el botón de minify solo si el engine tiene la feature "minify" en su array de features

## Approach

1. Agregar `"minify"` como literal type en el array de features de cada engine
2. En `GenericPlayground.tsx`, agregar `hasMinify = engine.features.includes("minify")` similar a `hasClean` y `hasExecute`
3. Pasar `handleMinify: hasMinify ? actions.handleMinify : undefined` al toolbar (similar a `handleExecute`)
4. Agregar `"minify"` a los arrays de features en json.engine.ts, js.engine.ts, html.engine.ts, css.engine.ts

## Affected Areas

| Area                                     | Impact   | Description                                                              |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `src/types/playground.ts`                | Modified | PlaygroundFeature type ya usa strings literales — no necesita cambio     |
| `src/playgrounds/GenericPlayground.tsx`  | Modified | Agregar hasMinify check (líneas 51-52) y conditionally pass handleMinify |
| `src/playgrounds/engines/json.engine.ts` | Modified | Agregar "minify" al array features                                       |
| `src/playgrounds/engines/js.engine.ts`   | Modified | Agregar "minify" al array features                                       |
| `src/playgrounds/engines/html.engine.ts` | Modified | Agregar "minify" al array features                                       |
| `src/playgrounds/engines/css.engine.ts`  | Modified | Agregar "minify" al array features                                       |

## Risks

| Risk                         | Likelihood | Mitigation                                                   |
| ---------------------------- | ---------- | ------------------------------------------------------------ |
| Olvidar un engine sin minify | Low        | Verificar que todos los engines con minify tengan el feature |

## Rollback Plan

Revertir los cambios en los archivos afectados:

- Quitar `hasMinify` check de GenericPlayground
- Quitar "minify" de los arrays features en cada engine

## Dependencies

Ninguno — solo cambios locales en archivos existentes.

## Success Criteria

- [ ] PHP Playground no muestra botón de minify
- [ ] JSON, JS, HTML, CSS playgrounds siguen mostrando botón de minify
- [ ] Tests existentes pasan sin cambios

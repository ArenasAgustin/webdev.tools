# Tasks: minify-button-optional

## Phase 1: Implement Feature Flag

- [ ] 1.1 Modificar `src/playgrounds/GenericPlayground.tsx`: Agregar `hasMinify = engine.features.includes("minify")` después de línea 52 (donde están hasClean y hasExecute)
- [ ] 1.2 Modificar `src/playgrounds/GenericPlayground.tsx`: En toolbarParams, cambiar `handleMinify: actions.handleMinify` por `handleMinify: hasMinify ? actions.handleMinify : undefined` (tanto en el branch con clean como sin clean)
- [ ] 1.3 Modificar `src/playgrounds/engines/json.engine.ts`: Agregar "minify" al array features: `["clean", "jsonPath", "minify"]`
- [ ] 1.4 Modificar `src/playgrounds/engines/js.engine.ts`: Agregar "minify" al array features: `["execute", "clean", "minify"]`
- [ ] 1.5 Modificar `src/playgrounds/engines/html.engine.ts`: Agregar "minify" al array features: `["preview", "clean", "minify"]`
- [ ] 1.6 Modificar `src/playgrounds/engines/css.engine.ts`: Agregar "minify" al array features: `["clean", "minify"]`

## Phase 2: Verify

- [ ] 2.1 Ejecutar `pnpm typecheck` y verificar que pasa
- [ ] 2.2 Ejecutar `pnpm test --run --grep "minify"` y verificar tests relacionados con minify pasan
- [ ] 2.3 Verificar manualmente que PHP Playground no muestra el botón de minify
- [ ] 2.4 Verificar manualmente que JSON, JS, HTML, CSS playgrounds siguen mostrando el botón de minify

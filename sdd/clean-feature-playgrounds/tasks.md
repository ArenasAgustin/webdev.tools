# Tasks: clean-feature-playgrounds

## Phase 1: Foundation - Types y Storage

- [x] 1.1 Agregar `JsCleanConfig` type y `DEFAULT_JS_CLEAN_CONFIG` en `src/types/js.ts`
- [x] 1.2 Agregar `CssCleanConfig` type y `DEFAULT_CSS_CLEAN_CONFIG` en `src/types/css.ts`
- [x] 1.3 Agregar `HtmlCleanConfig` type y `DEFAULT_HTML_CLEAN_CONFIG` en `src/types/html.ts`
- [x] 1.4 Agregar `loadJsCleanConfig`, `saveJsCleanConfig` en `src/services/storage.ts` (ya incluido en toolsConfig)
- [x] 1.5 Agregar `loadCssCleanConfig`, `saveCssCleanConfig` en `src/services/storage.ts` (ya incluido en toolsConfig)
- [x] 1.6 Agregar `loadHtmlCleanConfig`, `saveHtmlCleanConfig` en `src/services/storage.ts` (ya incluido en toolsConfig)

## Phase 2: Core Implementation - Transform Functions

- [x] 2.1 Implementar `cleanJs(input, options)` en `src/services/js/transform.ts`
- [x] 2.2 Implementar `cleanCss(input, options)` en `src/services/css/transform.ts`
- [x] 2.3 Implementar `cleanHtml(input, options)` en `src/services/html/transform.ts`

## Phase 3: Workers - Async Wrappers

- [x] 3.1 Agregar `action: "clean"` al `JsWorkerPayload` en `src/services/js/worker.types.ts`
- [x] 3.2 Agregar `action: "clean"` al `CssWorkerPayload` en `src/services/css/worker.types.ts`
- [x] 3.3 Agregar `action: "clean"` al `HtmlWorkerPayload` en `src/services/html/worker.types.ts`
- [x] 3.4 Implementar `cleanJsAsync()` wrapper en `src/services/js/worker.ts`
- [x] 3.5 Implementar `cleanCssAsync()` wrapper en `src/services/css/worker.ts`
- [x] 3.6 Implementar `cleanHtmlAsync()` wrapper en `src/services/html/worker.ts`

## Phase 4: Actions - HandleClean en Hooks

- [ ] 4.1 Agregar `handleClean` callback en `src/hooks/useJsPlaygroundActions.ts`
- [ ] 4.2 Agregar `handleClean` callback en `src/hooks/useCssPlaygroundActions.ts`
- [ ] 4.3 Agregar `handleClean` callback en `src/hooks/useHtmlPlaygroundActions.ts`

## Phase 5: Engines - Integración con GenericPlayground

- [ ] 5.1 Agregar `cleanConfig` y `features: ["execute", "clean"]` en `src/playgrounds/engines/js.engine.ts`
- [ ] 5.2 Agregar `cleanConfig` y `features: ["clean"]` en `src/playgrounds/engines/css.engine.ts`
- [ ] 5.3 Agregar `cleanConfig` y `features: ["clean"]` en `src/playgrounds/engines/html.engine.ts`

## Phase 6: Testing - Unit Tests

- [ ] 6.1 Agregar tests para `cleanJs()`: empty objects, arrays, functions, strings
- [ ] 6.2 Agregar tests para `cleanJs()`: preserve non-empty code, error on invalid JS
- [ ] 6.3 Agregar tests para `cleanCss()`: empty rules, rules with only comments
- [ ] 6.4 Agregar tests para `cleanCss()`: preserve valid rules
- [ ] 6.5 Agregar tests para `cleanHtml()`: empty tags, preserve semantic tags
- [ ] 6.6 Agregar tests para `cleanHtml()`: preserve pre, textarea, script, style

## Phase 7: Integration Testing

- [ ] 7.1 Verificar que toolbar muestra botón "Limpiar" para JS playground
- [ ] 7.2 Verificar que toolbar muestra botón "Limpiar" para CSS playground
- [ ] 7.3 Verificar que toolbar muestra botón "Limpiar" para HTML playground
- [ ] 7.4 Verificar que config modal tiene sección "Limpiar" con opciones

## Phase 8: E2E Testing

- [ ] 8.1 Crear E2E test: JS playground clean workflow
- [ ] 8.2 Crear E2E test: CSS playground clean workflow
- [ ] 8.3 Crear E2E test: HTML playground clean workflow
- [ ] 8.4 Verificar que clean config se persiste en localStorage

## Phase 9: Verification

- [ ] 9.1 Ejecutar `pnpm typecheck` - debe pasar sin errores
- [ ] 9.2 Ejecutar `pnpm lint` - debe pasar sin errores
- [ ] 9.3 Ejecutar `pnpm test:coverage --run` - todos los tests pasando
- [ ] 9.4 Ejecutar `pnpm verify:arch` - arquitectura validada
- [ ] 9.5 Actualizar `docs/ROADMAP.md` marcando feature como completada

# Proposal: clean-feature-playgrounds

## Intent

Implementar funcionalidad "Clean" en los playgrounds de JS, HTML y CSS que actualmente solo tienen format y minify. El objetivo es eliminar código/elementos vacíos o innecesarios, completando la paridad de features con JSON playground que ya tiene esta funcionalidad.

## Scope

### In Scope

- **JS Playground**: Implementar `cleanJs()` para remover variables no usadas, funciones vacías, objetos vacíos, arrays vacíos
- **CSS Playground**: Implementar `cleanCss()` para remover reglas vacías, selectores sin propiedades
- **HTML Playground**: Implementar `cleanHtml()` para remover etiquetas vacías
- **UI/UX**: Agregar botón "Limpiar" en toolbar y modal de configuración para cada playground
- **Tipos y configuraciones**: Agregar `JsCleanConfig`, `CssCleanConfig`, `HtmlCleanConfig` en types
- **Workers**: Implementar funciones async en los workers correspondientes
- **Tests**: Unit tests para funciones de clean + integración

### Out of Scope

- Features avanzadas de tree-shaking para JS (eliminar código no usado recursivamente)
- Minificación de CSS avanzada (solo cleaning de reglas vacías)
- Cleaning de comentarios en HTML/CSS/JS (ya cubrible con minify)

## Approach

1. **Análisis de código existente**: JSON ya tiene `cleanJson` funcionando - seguir mismo patrón
2. **Implementación por playground** (en orden: CSS → HTML → JS):
   - Agregar función `cleanX()` en `src/services/{x}/transform.ts`
   - Agregar tipos `XCleanConfig` en `src/types/{x}.ts`
   - Implementar worker wrapper async
   - Agregar `handleClean` en `useXPlaygroundActions.ts`
   - Agregar UI en toolbar + config modal
3. **Reutilización de patrones**:
   - Usar `createTransformHandler` factory (igual que JSON)
   - Reutilizar `PlaygroundFileConfig` pattern
   - Mismos estados de loading/error que format/minify

## Affected Areas

| Area                                         | Impact   | Description                     |
| -------------------------------------------- | -------- | ------------------------------- |
| `src/services/{js,css,html}/transform.ts`    | Modified | Agregar funciones `cleanX()`    |
| `src/services/{js,css,html}/worker.ts`       | Modified | Agregar wrappers async          |
| `src/services/{js,css,html}/workerClient.ts` | Modified | Exportar funciones clean        |
| `src/hooks/use{X}PlaygroundActions.ts`       | Modified | Agregar `handleClean`           |
| `src/types/{js,css,html}.ts`                 | Modified | Agregar tipos `XCleanConfig`    |
| `src/playgrounds/{x}/{X}Playground.tsx`      | Modified | Integrar handleClean            |
| `src/playgrounds/GenericPlayground.tsx`      | Modified | Soportar clean action si aplica |
| `e2e/cross-playground.spec.ts`               | Modified | E2E para feature clean          |

## Risks

| Risk                                      | Likelihood | Mitigation                                             |
| ----------------------------------------- | ---------- | ------------------------------------------------------ |
| Parsing de JS complejo (AST)              | Medium     | Usar parser ligero o regex básico en primera iteración |
| CSS parsing para detectar reglas vacías   | Low        | Regex para `{ }` vacío es suficiente                   |
| HTML etiquetas vacías vs contenido válido | Medium     | Excluir `<script>`, `<style>`, `<pre>`, `<textarea>`   |
| Breaking existing tests                   | Low        | Tests primero, no modificar los existentes             |

## Rollback Plan

1. Revertir cambios en `transform.ts` de cada playground
2. Eliminar tipos `XCleanConfig` de `types/{x}.ts`
3. Eliminar funciones de worker y workerClient
4. Eliminar `handleClean` de los hooks
5. Quitar botones de toolbar y opciones de config modal
6. Tests deben pasar sin los cambios de clean

## Dependencies

- Ninguna dependencia externa nueva
- Requiere: parsing existente (Terser para JS, regex para CSS/HTML)
- Pre-requisito: verificar que `createTransformHandler` funciona correctamente

## Success Criteria

- [ ] JS: `cleanJs("const x = {}; function y() {}")` → `""`
- [ ] CSS: `cleanCss("div {}")` → `""`
- [ ] HTML: `cleanHtml("<div></div>")` → `""`
- [ ] Botón "Limpiar" visible y funcional en toolbar de cada playground
- [ ] Config modal permite configurar opciones de clean
- [ ] Tests unitarios cubren funciones clean
- [ ] Tests de integración verifican UI
- [ ] E2E verifica workflow completo

# Design: clean-feature-playgrounds

## Technical Approach

Implementar la funcionalidad "Clean" en los playgrounds de JS, HTML y CSS siguiendo el patrón existente de JSON. Se reutilizará la infraestructura existente: transform functions → worker wrappers → actions hook → GenericPlayground integration.

## Architecture Decisions

### Decision: Reutilizar patrón de JSON para clean

**Choice**: Copiar la arquitectura de `cleanJson` para implementar `cleanJs`, `cleanCss`, `cleanHtml`
**Alternatives considered**: Crear un factory genérico `createCleanFunction` que funcione para todos los lenguajes
**Rationale**: Cada lenguaje tiene semánticas de "limpieza" muy diferentes (JS: objetos vacíos, CSS: reglas vacías, HTML: etiquetas vacías). Un factory genérico añadiría complejidad innecesaria. El patrón de JSON ya está probado y funciona.

### Decision: Strategy de parsing para clean JS

**Choice**: Usar regex básico + detección de patrones en primera iteración, no AST completo
**Alternatives considered**: Usar Babel AST parser, usar Acorn, usar Esprima
**Rationale**:

- AST añade ~200KB al bundle
- El objetivo es solo remover funciones/objetos vacíos, no análisis semántico
- Se puede mejorar con AST en versión futura si es necesario

### Decision: Exclusiones en HTML clean

**Choice**: Preservar `<script>`, `<style>`, `<pre>`, `<textarea>` al hacer clean de etiquetas vacías
**Alternatives considered**: Remover todas las etiquetas vacías incluyendo las semánticas
**Rationale**: Estas etiquetas tienen comportamiento esperado aunque estén vacías (scripts, estilos, código preformateado). Removerlas rompería funcionalidad.

### Decision: Configuración de clean en storage

**Choice**: Agregar `clean` key en el objeto de toolsConfig de cada playground
**Alternatives considered**: Storage separado para clean config
**Rationale**: Mantiene consistencia con JSON que ya tiene esta estructura. Facilita la migración futura.

## Data Flow

```
User clicks "Limpiar" button
         │
         ▼
Toolbar → handleClean() en useXPlaygroundActions
         │
         ├─→ createTransformHandler
         │         │
         │         ▼
         │    cleanXAsync (worker.ts)
         │         │
         │         ▼
         │    executeWorkerOperation
         │         │
         │         ▼
         │    cleanX en transform.ts
         │         │
         │         ▼
         └──── setOutput / setError
                   │
                   ▼
            GenericEditors muestra resultado
```

## File Changes

| File                                     | Action | Description                                             |
| ---------------------------------------- | ------ | ------------------------------------------------------- |
| `src/types/js.ts`                        | Modify | Agregar `JsCleanConfig`, `DEFAULT_JS_CLEAN_CONFIG`      |
| `src/types/css.ts`                       | Modify | Agregar `CssCleanConfig`, `DEFAULT_CSS_CLEAN_CONFIG`    |
| `src/types/html.ts`                      | Modify | Agregar `HtmlCleanConfig`, `DEFAULT_HTML_CLEAN_CONFIG`  |
| `src/services/js/transform.ts`           | Modify | Agregar `cleanJs()` function                            |
| `src/services/css/transform.ts`          | Modify | Agregar `cleanCss()` function                           |
| `src/services/html/transform.ts`         | Modify | Agregar `cleanHtml()` function                          |
| `src/services/js/worker.ts`              | Modify | Agregar `cleanJsAsync()` wrapper                        |
| `src/services/css/worker.ts`             | Modify | Agregar `cleanCssAsync()` wrapper                       |
| `src/services/html/worker.ts`            | Modify | Agregar `cleanHtmlAsync()` wrapper                      |
| `src/services/js/worker.types.ts`        | Modify | Agregar `action: "clean"` al payload type               |
| `src/services/css/worker.types.ts`       | Modify | Agregar `action: "clean"` al payload type               |
| `src/services/html/worker.types.ts`      | Modify | Agregar `action: "clean"` al payload type               |
| `src/services/storage.ts`                | Modify | Agregar load/save para clean config                     |
| `src/hooks/useJsPlaygroundActions.ts`    | Modify | Agregar `handleClean` callback                          |
| `src/hooks/useCssPlaygroundActions.ts`   | Modify | Agregar `handleClean` callback                          |
| `src/hooks/useHtmlPlaygroundActions.ts`  | Modify | Agregar `handleClean` callback                          |
| `src/playgrounds/engines/js.engine.ts`   | Modify | Agregar `cleanConfig`, `features: ["execute", "clean"]` |
| `src/playgrounds/engines/css.engine.ts`  | Modify | Agregar `cleanConfig`, `features: ["clean"]`            |
| `src/playgrounds/engines/html.engine.ts` | Modify | Agregar `cleanConfig`, `features: ["clean"]`            |
| `src/services/js/transform.test.ts`      | Modify | Agregar tests para `cleanJs`                            |
| `src/services/css/transform.test.ts`     | Modify | Agregar tests para `cleanCss`                           |
| `src/services/html/transform.test.ts`    | Modify | Agregar tests para `cleanHtml`                          |

## Interfaces / Contracts

### JsCleanConfig

```typescript
export type JsCleanConfig = ConfigWithAutoCopy<{
  removeEmptyObject: boolean;
  removeEmptyArray: boolean;
  removeEmptyFunction: boolean;
  removeEmptyString: boolean;
}>;

export const DEFAULT_JS_CLEAN_CONFIG: JsCleanConfig = {
  removeEmptyObject: true,
  removeEmptyArray: true,
  removeEmptyFunction: true,
  removeEmptyString: true,
  autoCopy: false,
};
```

### CssCleanConfig

```typescript
export type CssCleanConfig = ConfigWithAutoCopy<{
  removeEmptyRules: boolean;
  removeRulesWithOnlyComments: boolean;
}>;

export const DEFAULT_CSS_CLEAN_CONFIG: CssCleanConfig = {
  removeEmptyRules: true,
  removeRulesWithOnlyComments: true,
  autoCopy: false,
};
```

### HtmlCleanConfig

```typescript
export type HtmlCleanConfig = ConfigWithAutoCopy<{
  removeEmptyTags: boolean;
}>;

export const DEFAULT_HTML_CLEAN_CONFIG: HtmlCleanConfig = {
  removeEmptyTags: true,
  autoCopy: false,
};
```

### Worker Payload (ejemplo para JS)

```typescript
export type JsWorkerPayload =
  | ({ action: "format"; options?: JsFormatOptions } & WorkerPayloadBase)
  | ({ action: "minify"; options?: JsMinifyOptions } & WorkerPayloadBase)
  | ({ action: "clean"; options?: JsCleanOptions } & WorkerPayloadBase);
```

## Testing Strategy

| Layer       | What to Test                             | Approach                                  |
| ----------- | ---------------------------------------- | ----------------------------------------- |
| Unit        | `cleanJs()`, `cleanCss()`, `cleanHtml()` | Tests directos a funciones, casos edge    |
| Unit        | Error handling en inputs inválidos       | Input malformado no rompe el playground   |
| Integration | `handleClean` en actions hooks           | Test con mocks de worker                  |
| Integration | Toolbar muestra botón clean              | Verificar presencia de botón              |
| Integration | Config modal tiene sección clean         | Verificar UI de configuración             |
| E2E         | Workflow completo clean                  | Playwright: click clean, verificar output |

## Migration / Rollout

No se requiere migración de datos. La feature es aditiva:

1. Agregar clean config types
2. Agregar clean functions a transform/worker
3. Agregar handleClean a hooks
4. Agregar cleanConfig a engines (features: ["clean"])
5. GenericPlayground ya maneja clean si está en features

## Open Questions

- [ ] **CSS clean**: ¿Debería también remover `@media` queries vacíos? Por ahora solo reglas CSS básicas.
- [ ] **JS clean**: ¿Soportar arrow functions vacías `() => {}`? Sí, implementar como parte de `removeEmptyFunction`.
- [ ] **HTML clean**: ¿Remover comentarios vacíos `<!-- -->`? Eso es minify, no clean. Dejar para otra iteración.

## Implementación sugerida (orden)

1. **Types**: Agregar XCleanConfig en `src/types/{js,css,html}.ts`
2. **Storage**: Agregar load/save clean config en `src/services/storage.ts`
3. **Transform**: Implementar clean functions en `src/services/{js,css,html}/transform.ts`
4. **Workers**: Agregar wrappers async en worker.ts y tipos en worker.types.ts
5. **Actions**: Agregar handleClean en useXPlaygroundActions.ts
6. **Engines**: Agregar cleanConfig y features: ["clean"]
7. **Tests**: Agregar tests unitarios para transform functions

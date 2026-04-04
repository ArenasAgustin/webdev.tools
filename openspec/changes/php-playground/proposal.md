# Proposal: PHP Playground

## Intent

Agregar un playground para PHP que permita parsear, formatear y validar código PHP entirely client-side. El usuario quiere seguir el mismo patrón existente de JS Playground pero para PHP, sin funcionalidad de ejecución por ahora.

## Scope

### In Scope

- **Config**: `src/playgrounds/php/php.config.ts` (PlaygroundConfig)
- **Service**: `src/services/php/service.ts` (interfaz de PlaygroundService)
- **Transform**: `src/services/php/transform.ts` (format, parse, validate)
- **Hook**: `src/hooks/usePhpPlaygroundActions.ts` (acciones del playground)
- **Component**: `src/playgrounds/php/PhpPlayground.tsx`
- **Tests**: Tests TDD para cada servicio y hook

### Out of Scope

- Ejecución de código PHP (server-side execution)
- Editor online con output live
- Funcionalidades avanzadas de linting/fixing

## Capabilities

### New Capabilities

- `php-parse`: Validar sintaxis de código PHP usando php-parser
- `php-format`: Formatear código PHP usando @prettier/plugin-php
- `php-validate`: Alias de parse para validar código

## Approach

Seguir exactamente el patrón de JS Playground:

1. Crear `php.config.ts` siguiendo estructura de `js.config.ts`
2. En `transform.ts`: usar `php-parser` para parse/validate, `@prettier/plugin-php` para format
3. En `service.ts`: crear PlaygroundService wrapper (format, minify vacío, emptyMessage)
4. En `usePhpPlaygroundActions.ts`: seguir estructura de `useJsPlaygroundActions.ts` pero sin execute
5. En `PhpPlayground.tsx`: componente usando GenericPlayground

## Affected Areas

| Area                          | Impact   | Description                                                |
| ----------------------------- | -------- | ---------------------------------------------------------- |
| `src/playgrounds/registry.ts` | Modified | Agregar PHP al registry                                    |
| `src/types/`                  | Modified | Agregar tipos PHP (PhpFormatConfig, etc.)                  |
| `package.json`                | Modified | Agregar dependencias: `php-parser`, `@prettier/plugin-php` |

## Risks

| Risk                              | Likelihood | Mitigation                                  |
| --------------------------------- | ---------- | ------------------------------------------- |
| PHP parser no funciona en browser | Low        | php-parser es compatible con browser        |
| Prettier plugin PHP no compatible | Low        | Verificar compatibilidad antes de install   |
| Performance con archivos grandes  | Medium     | Agregar input size limit como JS Playground |

## Rollback Plan

1. Eliminar archivos creados en `src/playgrounds/php/` y `src/services/php/`
2. Remover dependencias de package.json
3. Revertir cambios en registry.ts
4. Eliminar tipos PHP agregados

## Dependencies

- `php-parser` (^4.x) - Parser AST para PHP
- `@prettier/plugin-php` - Plugin de Prettier para PHP

## Success Criteria

- [ ] Tests unitarios pasando (format, parse, validate)
- [ ] Playground carga correctamente en UI
- [ ] Registro en sidebar funciona
- [ ] Build pasa sin errores
- [ ] typecheck y lint limpios

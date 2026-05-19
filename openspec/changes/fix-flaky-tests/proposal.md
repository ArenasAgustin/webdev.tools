# Proposal: Fix Flaky Tests in CI

## Intent

Los tests en la rama `fix/flaky-tests` están fallando de manera intermitente en CI debido a:
1. **Falta de contexto de i18n**: Los tests buscan textos en español (ej: "Unix timestamp o fecha"), pero no tienen el `I18nextProvider`.
2. **Mocks de workers incorrectos**: Los mocks en `workerHarness.ts` no devuelven los valores esperados (éxito/error).
3. **Problema con `validateCss`**: El test espera `ok: false`, pero devuelve `ok: true`.

Estos problemas impiden que los tests pasen de manera estable en CI, lo que bloquea el despliegue de cambios.

## Scope

### In Scope
- Asegurar que los tests tengan acceso al contexto de i18n (`I18nextProvider`).
- Corregir los mocks de workers en `workerHarness.ts` para devolver valores esperados.
- Validar que `validateCss` devuelva `ok: false` cuando corresponda.
- Verificar la estabilidad de los tests en CI.

### Out of Scope
- Refactorizar los tests existentes (solo se corrigen los problemas identificados).
- Cambios en la lógica de negocio de los componentes.
- Actualización de dependencias.


## Capabilities

### New Capabilities
- Ninguna.

### Modified Capabilities
- **`test-environment`**: Actualizar el entorno de pruebas para incluir el contexto de i18n y mocks de workers correctos.
- **`worker-mocks`**: Corregir los mocks de workers para devolver valores esperados (éxito/error).
- **`css-validation`**: Asegurar que `validateCss` devuelva `ok: false` cuando corresponda.


## Approach

1. **Contexto de i18n**:
   - Envolver los componentes bajo prueba con `I18nextProvider` en los tests.
   - Asegurar que los textos en español estén disponibles en los recursos de i18n.

2. **Mocks de workers**:
   - Actualizar `workerHarness.ts` para devolver valores esperados (éxito/error) en los mocks.
   - Verificar que los mocks sean consistentes con la lógica de los workers reales.

3. **Validación de CSS**:
   - Corregir la función `validateCss` para que devuelva `ok: false` cuando el CSS sea inválido.
   - Asegurar que los tests esperen el comportamiento correcto.


## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/TimestampPlayground.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/PasswordPlayground.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/HashPlayground.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/JsPlayground.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/Toolbar.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/JsonPathHistoryModal.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/components/RadioGroup.test.tsx` | Modified | Añadir `I18nextProvider`. |
| `src/workers/worker.test.ts` | Modified | Corregir mocks de workers. |
| `src/workers/workerHarness.ts` | Modified | Actualizar mocks de workers. |
| `src/utils/transform.test.ts` | Modified | Corregir validación de CSS. |


## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Los tests sigan fallando en CI | Medium | Ejecutar los tests localmente antes de subir cambios. |
| Introducir nuevos problemas en los mocks | Low | Verificar que los mocks sean consistentes con la lógica real. |
| Problemas de compatibilidad con i18n | Low | Asegurar que los recursos de i18n estén disponibles en los tests. |


## Rollback Plan

1. Revertir los cambios en los archivos de tests afectados.
2. Restaurar los mocks originales en `workerHarness.ts`.
3. Verificar que los tests vuelvan a su estado original.


## Dependencies

- **i18next**: Asegurar que los recursos de i18n estén disponibles en los tests.
- **Vitest**: Ejecutar los tests localmente para validar los cambios.


## Success Criteria

- [ ] Todos los tests pasan de manera estable en CI.
- [ ] Los tests no fallan por falta de contexto de i18n.
- [ ] Los mocks de workers devuelven valores esperados (éxito/error).
- [ ] `validateCss` devuelve `ok: false` cuando el CSS es inválido.
- [ ] Los tests son reproducibles localmente y en CI.

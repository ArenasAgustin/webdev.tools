# Testing Guidelines

## Patrones de Solución para Tests Flaky

### 1. Contexto de i18n
**Problema**: Tests fallan con `Unable to find an element with the text`.
**Solución**: Usar `renderWithI18n` + mock de `i18n.t`.

**Ejemplo**:
```tsx
import { renderWithI18n } from "@/test/test-utils";

it("renders correctly with i18n", () => {
  const renderResult = renderWithI18n(<MyComponent />);
  expect(renderResult.getByText("Texto en español")).toBeInTheDocument();
});
```

**Archivo `test-utils.tsx`**:
```tsx
export const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18nMock}>
      {component}
    </I18nextProvider>
  );
};

const i18nMock = {
  t: (key: string) => translations[key], // Mock de traducciones
};
```

---

### 2. Animaciones en Tests
**Problema**: Tests fallan con warnings de `act` o falsos negativos por animaciones.
**Solución**: Deshabilitar animaciones en tests con CSS.

**Ejemplo**:
```tsx
// ToastWrapper.tsx (o componente similar)
const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{
      transform: "translate-x-0 !important",
      opacity: "1 !important",
      transition: "none !important",
    }}>
      {children}
    </div>
  );
};
```

---

### 3. Guards Asíncronos
**Problema**: Tests fallan por timing en guards asíncronos.
**Solución**: Usar `vi.useFakeTimers()` + `act(async () => { await vi.advanceTimersByTimeAsync(100); })`.

**Ejemplo**:
```tsx
it("handles async guards", async () => {
  vi.useFakeTimers();
  render(<MyComponent />);
  
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  
  expect(screen.getByText("Guard passed")).toBeInTheDocument();
});
```

---

### 4. Configuración de Vitest
**Problema**: Tests fallan por timeouts o workers.
**Solución**: Ajustar configuración en `vitest.config.ts`.

**Ejemplo**:
```ts
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 30_000,
    pool: "threads",
    isolate: false, // Cuidado: puede causar contaminación entre tests
  },
});
```

---

### 5. Mocks de Workers y Servicios
**Problema**: Tests fallan con `ERR_WORKER_OUT_OF_MEMORY` o mocks insuficientes.
**Solución**: Mockear workers y servicios con `vi.mock`.

**Ejemplo**:
```tsx
vi.mock("@/services/json/workerClient", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    transformJson: vi.fn().mockResolvedValue("mocked result"),
  };
});
```

---

### 6. Limpieza de Estado
**Problema**: Tests fallan por estado compartido entre tests.
**Solución**: Usar `cleanup()` de `@testing-library/react`.

**Ejemplo**:
```tsx
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
```

---

## Issues Pendientes
1. **[OfflineBanner.test.tsx]**: Limpieza de estado entre tests ([#ISSUE_NUMBER]).
2. **[JsonPlayground.test.tsx]**: Mocks insuficientes para servicios de transformación ([#ISSUE_NUMBER]).
3. **[Workers]**: `ERR_WORKER_OUT_OF_MEMORY` y mocks incompletos ([#ISSUE_NUMBER]).
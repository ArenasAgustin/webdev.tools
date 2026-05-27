// Mock para window y navigator en entorno de testing SSR
if (typeof window === "undefined") {
  // @ts-expect-error - Mock para compatibilidad con SSR en tests
  globalThis.window = globalThis;
}

// Mock para navigator.onLine
Object.defineProperty(globalThis, "navigator", {
  value: {
    onLine: true,
  },
  writable: true,
});

import { useEffect, useRef } from "react";

/**
 * Hook que implementa un focus trap para mantener el foco dentro de un contenedor.
 * Útil para modales y diálogos para cumplir con WCAG 2.1.
 *
 * @param isActive - Si el focus trap debe estar activo
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Guardar el elemento activo anterior
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Enfocar el primer elemento enfocable en el contenedor
    const getFocusableElements = () =>
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    const initialFocusable = getFocusableElements();
    if (initialFocusable[0]) {
      initialFocusable[0].focus();
    }

    // Manejar Tab para hacer trap del foco.
    // Re-query on every keypress so the list is never stale if the DOM changes.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return; // Early return if trap is no longer active
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey) {
        // Tab hacia atrás
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab hacia adelante
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    // Cleanup: restaurar foco al elemento anterior
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElementRef.current?.isConnected === true) previousActiveElementRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

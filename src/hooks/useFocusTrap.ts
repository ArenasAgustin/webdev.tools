import { useEffect, useRef } from "react";

/**
 * Hook que implementa un focus trap para mantener el foco dentro de un contenedor.
 * Útil para modales y diálogos para cumplir con WCAG 2.1.
 *
 * @param isActive - Si el focus trap debe estar activo
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Guardar el elemento activo anterior
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Enfocar el primer elemento enfocable en el contenedor
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Manejar Tab para hacer trap del foco
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

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
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

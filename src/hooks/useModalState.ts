import { useState, useCallback } from "react";

/**
 * Generic hook for managing modal open/close state
 * Provides consistent API for modal visibility management
 *
 * @param initialState - Initial open state (default: false)
 * @returns Object with state and control functions
 *
 * @example
 * ```tsx
 * const configModal = useModalState();
 *
 * return (
 *   <>
 *     <button onClick={configModal.open}>Settings</button>
 *     <ConfigModal
 *       isOpen={configModal.isOpen}
 *       onClose={configModal.close}
 *     />
 *   </>
 * );
 * ```
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  } as const;
}

/**
 * Type for the return value of useModalState
 * Useful for prop types and function parameters
 */
export type ModalState = ReturnType<typeof useModalState>;

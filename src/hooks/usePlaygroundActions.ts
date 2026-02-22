import { useCallback } from "react";
import { downloadFile } from "@/utils/download";
import { createValidatedHandler } from "@/utils/handlerFactory";

/**
 * Toast API interface
 */
export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Base props for playground actions hook
 */
export interface UsePlaygroundActionsProps<TInput = string> {
  /** Current input value */
  input: TInput;
  /** Update input value */
  setInput: (value: TInput) => void;
  /** Example content to load */
  exampleContent: TInput;
  /** Toast API for notifications */
  toast?: ToastApi;
  /** Optional callback to clear additional outputs when input is cleared */
  onClearOutputs?: () => void;
  /** Optional validation for input size/content */
  validateInput?: () => string | null;
}

/**
 * Copy to clipboard options
 */
export interface CopyOptions {
  /** Text to copy to clipboard */
  text: string;
  /** Success message for toast */
  successMessage?: string;
  /** Optional validation function */
  validate?: () => string | null;
}

/**
 * Download file options
 */
export interface DownloadOptions {
  /** Content to download */
  content: string;
  /** File name */
  fileName: string;
  /** MIME type */
  mimeType: string;
  /** Success message for toast */
  successMessage?: string;
  /** Optional validation function */
  validate?: () => string | null;
}

/**
 * Base hook for common playground actions
 * Provides reusable handlers for clear, load example, copy, and download operations
 */
export function usePlaygroundActions<TInput = string>({
  setInput,
  exampleContent,
  toast,
  onClearOutputs,
  validateInput,
}: UsePlaygroundActionsProps<TInput>) {
  /**
   * Clear input and outputs
   */
  const handleClearInput = useCallback(() => {
    setInput("" as TInput);
    onClearOutputs?.();
    toast?.success("Entrada limpiada");
  }, [setInput, onClearOutputs, toast]);

  /**
   * Load example content
   */
  const handleLoadExample = useCallback(() => {
    setInput(exampleContent);
    onClearOutputs?.();
    toast?.success("Ejemplo cargado");
  }, [setInput, exampleContent, onClearOutputs, toast]);

  /**
   * Copy text to clipboard with validation
   */
  const handleCopy = useCallback(
    (options: CopyOptions) => {
      const { text, successMessage = "Copiado al portapapeles", validate } = options;

      createValidatedHandler({
        validate: validate ?? (() => (!text ? "No hay contenido para copiar" : null)),
        run: async () => {
          await navigator.clipboard.writeText(text);
        },
        toast,
        successMessage,
        errorMessage: "Error al copiar al portapapeles",
      })();
    },
    [toast],
  );

  /**
   * Download content as file with validation
   */
  const handleDownload = useCallback(
    (options: DownloadOptions) => {
      const {
        content,
        fileName,
        mimeType,
        successMessage = `Descargado como ${fileName}`,
        validate,
      } = options;

      createValidatedHandler({
        validate: validate ?? (() => (!content ? "No hay contenido para descargar" : null)),
        run: () => {
          downloadFile(content, fileName, mimeType);
        },
        toast,
        successMessage,
      })();
    },
    [toast],
  );

  /**
   * Create a validation function that checks input size
   */
  const createInputValidator = useCallback(() => validateInput?.() ?? null, [validateInput]);

  return {
    handleClearInput,
    handleLoadExample,
    handleCopy,
    handleDownload,
    createInputValidator,
  };
}

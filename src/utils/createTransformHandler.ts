import { compactTransformError } from "./transformError";

interface TransformActionConfig {
  run: () => Promise<string>;
  onSuccess: (result: string) => void;
  onError: (message: string) => void;
  successMessage: string;
  errorMessage: string;
}

interface CreateTransformHandlerParams {
  runTransformAction: (config: TransformActionConfig) => void;
  run: () => Promise<string>;
  setOutput: (value: string) => void;
  setError: (error: string | null) => void;
  autoCopy?: boolean;
  successMessage: string;
  errorMessage: string;
}

export function createTransformHandler({
  runTransformAction,
  run,
  setOutput,
  setError,
  autoCopy,
  successMessage,
  errorMessage,
}: CreateTransformHandlerParams): void {
  runTransformAction({
    run,
    onSuccess: (value) => {
      setError(null);
      setOutput(value);
      if (autoCopy && value) {
        navigator.clipboard.writeText(value).catch((err: unknown) => {
          console.error("Error al copiar al portapapeles: ", err);
        });
      }
    },
    onError: (message) => {
      setError(compactTransformError(message));
    },
    successMessage,
    errorMessage,
  });
}

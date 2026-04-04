import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { validatePhp } from "@/services/php/transform";

const validatePhpAsync = (source: string) => Promise.resolve(validatePhp(source));

export function usePhpParser(input: string): ValidationState {
  return useAsyncValidator(input, validatePhpAsync, "PHP inválido");
}

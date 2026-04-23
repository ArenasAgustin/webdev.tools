import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { validateCss } from "@/services/css/transform";

export function useCssParser(input: string): ValidationState {
  return useAsyncValidator(input, validateCss, "CSS inválido");
}

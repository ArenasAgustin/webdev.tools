import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { formatCss } from "@/services/css/transform";

export function useCssParser(input: string): ValidationState {
  return useAsyncValidator(input, formatCss, "CSS inválido");
}

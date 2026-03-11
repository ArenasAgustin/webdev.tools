import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { formatHtml } from "@/services/html/transform";

export function useHtmlParser(input: string): ValidationState {
  return useAsyncValidator(input, formatHtml, "HTML inválido");
}

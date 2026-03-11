import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { minifyJs } from "@/services/js/transform";

const validateJs = (source: string) =>
  Promise.resolve(minifyJs(source, { removeComments: false, removeSpaces: false }));

export function useJsParser(input: string): ValidationState {
  return useAsyncValidator(input, validateJs, "Código inválido");
}

import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { translate } from "@/i18n/translate";
import { validateCss } from "@/services/css/transform";

export function useCssParser(input: string): ValidationState {
  return useAsyncValidator(
    input,
    validateCss,
    translate("editor.invalidLabel", { language: "CSS" }),
  );
}

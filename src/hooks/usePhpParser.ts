import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { translate } from "@/i18n/translate";
import { validatePhp } from "@/services/php/transform";

const validatePhpAsync = (source: string) => Promise.resolve(validatePhp(source));

export function usePhpParser(input: string): ValidationState {
  return useAsyncValidator(
    input,
    validatePhpAsync,
    translate("editor.invalidLabel", { language: "PHP" }),
    // validatePhp already reports "Syntax error on line N: ...".
    { prefixed: true },
  );
}

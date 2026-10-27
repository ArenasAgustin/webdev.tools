import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { translate } from "@/i18n/translate";
import { formatHtml } from "@/services/html/transform";

export function useHtmlParser(input: string): ValidationState {
  return useAsyncValidator(
    input,
    formatHtml,
    translate("editor.invalidLabel", { language: "HTML" }),
  );
}

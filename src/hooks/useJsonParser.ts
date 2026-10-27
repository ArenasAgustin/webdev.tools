import { useAsyncValidator, type ValidationState } from "@/hooks/useAsyncValidator";
import { translate } from "@/i18n/translate";
import { parseJson } from "@/services/json/transform";

const validateJson = (source: string) => {
  const result = parseJson(source);
  if (result.ok) return Promise.resolve({ ok: true as const });
  return Promise.resolve({ ok: false as const, error: result.error.message });
};

export function useJsonParser(input: string): ValidationState {
  return useAsyncValidator(
    input,
    validateJson,
    translate("editor.invalidLabel", { language: "JSON" }),
  );
}

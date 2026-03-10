import { memo } from "react";
import { GenericEditors } from "@/components/editor/GenericEditors";
import type { JsonValidationState } from "@/types/json";

interface JsonEditorsProps {
  inputJson: string;
  output: string;
  error: string | null;
  validationState: JsonValidationState;
  inputWarning?: string | null;
  onInputChange: (value: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

export const JsonEditors = memo(function JsonEditors({ inputJson, ...rest }: JsonEditorsProps) {
  return (
    <GenericEditors
      input={inputJson}
      language="json"
      inputTitle="JSON"
      inputPlaceholder="Pega tu JSON aquí..."
      waitingLabel="Esperando JSON..."
      validLabel="JSON válido"
      invalidLabel="JSON inválido"
      {...rest}
    />
  );
});

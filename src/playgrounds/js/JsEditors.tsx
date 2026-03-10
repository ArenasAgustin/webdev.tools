import { memo } from "react";
import { GenericEditors } from "@/components/editor/GenericEditors";

interface JsEditorsProps {
  inputJs: string;
  output: string;
  error: string | null;
  validationState: {
    isValid: boolean;
    error: {
      message: string;
    } | null;
  };
  inputWarning?: string | null;
  onInputChange: (code: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

export const JsEditors = memo(function JsEditors({ inputJs, ...rest }: JsEditorsProps) {
  return (
    <GenericEditors
      input={inputJs}
      language="javascript"
      inputTitle="JavaScript"
      inputPlaceholder="Escribe tu código JavaScript aquí..."
      waitingLabel="Esperando JavaScript..."
      validLabel="JavaScript válido"
      invalidLabel="JavaScript inválido"
      {...rest}
    />
  );
});

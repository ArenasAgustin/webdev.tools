import { memo } from "react";
import { GenericEditors } from "@/components/editor/GenericEditors";

interface CssEditorsProps {
  inputCss: string;
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

export const CssEditors = memo(function CssEditors({ inputCss, ...rest }: CssEditorsProps) {
  return (
    <GenericEditors
      input={inputCss}
      language="css"
      inputTitle="CSS"
      inputPlaceholder="Escribe tu CSS aquí..."
      waitingLabel="Esperando CSS..."
      validLabel="CSS válido"
      invalidLabel="CSS inválido"
      {...rest}
    />
  );
});

import { type ReactNode } from "react";
import type { JsonValidationState } from "@/playgrounds/json/json.types";

interface ValidationStatusProps {
  inputValue: string;
  validationState: JsonValidationState;
  validExtra?: ReactNode;
  className?: string;
  withWrapper?: boolean;
  withFlex?: boolean;
}

/**
 * Validation status display for JSON input
 */
export function ValidationStatus({
  inputValue,
  validationState,
  validExtra,
  className = "",
  withWrapper = false,
  withFlex = false,
}: ValidationStatusProps) {
  const wrapperClass = withWrapper
    ? `text-xs h-4 ${withFlex ? "flex items-center gap-1" : ""}`
    : "";

  const content = (() => {
    if (inputValue.trim() === "") {
      return (
        <span className={`text-gray-400 ${className}`}>Esperando JSON...</span>
      );
    }

    if (validationState.isValid) {
      return (
        <span className={`text-green-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-check-circle"></i> JSON válido
          {validExtra}
        </span>
      );
    }

    return (
      <span className={`text-red-400 flex items-center gap-1 ${className}`}>
        <i className="fas fa-exclamation-circle"></i>{" "}
        {validationState.error?.message || "JSON inválido"}
      </span>
    );
  })();

  if (withWrapper) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return content;
}

import { type ReactNode, memo, useMemo } from "react";

interface ValidationState {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

interface ValidationStatusProps {
  inputValue: string;
  validationState: ValidationState;
  validExtra?: ReactNode;
  warning?: ReactNode;
  className?: string;
  withWrapper?: boolean;
  withFlex?: boolean;
}

/**
 * Validation status display for JSON input
 * Memoized to prevent unnecessary re-renders
 */
export const ValidationStatus = memo(function ValidationStatus({
  inputValue,
  validationState,
  validExtra,
  warning,
  className = "",
  withWrapper = false,
  withFlex = false,
}: ValidationStatusProps) {
  const wrapperClass = withWrapper
    ? `text-xs h-4 ${withFlex ? "flex items-center gap-1" : ""}`
    : "";

  const warningNode = useMemo(
    () => (warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null),
    [warning],
  );

  const content = useMemo(() => {
    if (inputValue.trim() === "") {
      return (
        <span className={`text-gray-400 ${className}`}>
          Esperando JSON...
          {warningNode}
        </span>
      );
    }

    if (validationState.isValid) {
      return (
        <span className={`text-green-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-check-circle"></i> JSON válido
          {validExtra}
          {warningNode}
        </span>
      );
    }

    return (
      <span className={`text-red-400 flex items-center gap-1 ${className}`}>
        <i className="fas fa-exclamation-circle"></i>{" "}
        {validationState.error?.message ?? "JSON inválido"}
        {warningNode}
      </span>
    );
  }, [inputValue, validationState, validExtra, warningNode, className]);

  if (withWrapper) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return content;
});

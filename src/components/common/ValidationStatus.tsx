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
  waitingLabel?: string;
  validLabel?: string;
  invalidLabel?: string;
  truncateError?: boolean;
  className?: string;
  withWrapper?: boolean;
  withFlex?: boolean;
}

/**
 * Validation status display for playground input
 * Memoized to prevent unnecessary re-renders
 */
export const ValidationStatus = memo(function ValidationStatus({
  inputValue,
  validationState,
  validExtra,
  warning,
  waitingLabel = "Esperando JSON...",
  validLabel = "JSON válido",
  invalidLabel = "JSON inválido",
  truncateError = false,
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
          {waitingLabel}
          {warningNode}
        </span>
      );
    }

    if (validationState.isValid) {
      return (
        <span className={`text-green-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-check-circle"></i> {validLabel}
          {validExtra}
          {warningNode}
        </span>
      );
    }

    const errorMessage = validationState.error?.message ?? invalidLabel;

    if (truncateError) {
      return (
        <span
          className={`text-red-400 flex min-w-0 w-full items-center gap-1 overflow-hidden ${className}`}
        >
          <i className="fas fa-exclamation-circle"></i>
          <span
            className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
            title={errorMessage}
          >
            {errorMessage}
          </span>
          {warningNode}
        </span>
      );
    }

    return (
      <span className={`text-red-400 flex items-center gap-1 ${className}`}>
        <i className="fas fa-exclamation-circle"></i> {errorMessage}
        {warningNode}
      </span>
    );
  }, [
    inputValue,
    validationState,
    validExtra,
    warningNode,
    waitingLabel,
    validLabel,
    invalidLabel,
    truncateError,
    className,
  ]);

  if (withWrapper) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return content;
});

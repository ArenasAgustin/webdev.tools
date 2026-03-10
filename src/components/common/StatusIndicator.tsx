import { type ReactNode, memo, useMemo } from "react";

interface StatusIndicatorProps {
  /** The text value (input or output) — used to detect the empty state */
  value: string;
  /** String error (output) or object error with message (input validation) */
  error?: string | { message: string } | null;
  /** Whether the value is valid — only relevant for input validation */
  isValid?: boolean;
  /** Warning message shown alongside status */
  warning?: ReactNode;
  /** Label shown when value is empty */
  waitingLabel?: string;
  /** Label shown when value is valid */
  validLabel?: string;
  /** Fallback label when error has no message */
  invalidLabel?: string;
  /** Whether to show the valid label text (defaults to true) */
  showValidLabel?: boolean;
  /** Truncate long error messages with ellipsis */
  truncateError?: boolean;
  /** Extra content rendered after the valid state (e.g. Stats) */
  validExtra?: ReactNode;
  className?: string;
  /** Wrap content in a sized div */
  withWrapper?: boolean;
  /** Add flex layout to wrapper */
  withFlex?: boolean;
}

/**
 * Unified status indicator for input validation and output status.
 * Replaces both `ValidationStatus` and `OutputStatus`.
 */
export const StatusIndicator = memo(function StatusIndicator({
  value,
  error,
  isValid,
  warning,
  waitingLabel = "Esperando...",
  validLabel = "",
  invalidLabel = "",
  showValidLabel = true,
  truncateError = false,
  validExtra,
  className = "",
  withWrapper = false,
  withFlex = false,
}: StatusIndicatorProps) {
  const wrapperClass = withWrapper
    ? `text-xs h-4 ${withFlex ? "flex items-center gap-1" : ""}`
    : "";

  const warningNode = useMemo(
    () => (warning ? <span className="text-amber-400 ml-2 truncate">{warning}</span> : null),
    [warning],
  );

  const content = useMemo(() => {
    // String error (output errors like "Format failed")
    if (typeof error === "string" && error) {
      return (
        <span className={`text-red-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </span>
      );
    }

    // Empty state
    if (value.trim() === "") {
      return (
        <span className={`text-gray-400 ${className}`}>
          {waitingLabel}
          {warningNode}
        </span>
      );
    }

    // Validation: explicitly valid
    if (isValid === true) {
      return (
        <span className={`text-green-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-check-circle"></i> {validLabel}
          {validExtra}
          {warningNode}
        </span>
      );
    }

    // Validation: explicitly invalid (object error)
    if (isValid === false) {
      const errorMessage =
        typeof error === "object" ? (error?.message ?? invalidLabel) : invalidLabel;

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
    }

    // Output valid state (no isValid flag, no error, non-empty)
    return (
      <>
        {showValidLabel && validLabel && (
          <span className={`text-green-400 flex items-center gap-1 ${className}`}>
            <i className="fas fa-check-circle"></i> {validLabel}
          </span>
        )}
        {validExtra}
      </>
    );
  }, [
    value,
    error,
    isValid,
    validExtra,
    warningNode,
    waitingLabel,
    validLabel,
    invalidLabel,
    showValidLabel,
    truncateError,
    className,
  ]);

  if (withWrapper) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return content;
});

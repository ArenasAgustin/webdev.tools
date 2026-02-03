import { type ReactNode } from "react";

interface OutputStatusProps {
  outputValue: string;
  outputError: string | null;
  validExtra?: ReactNode;
  showValidLabel?: boolean;
  className?: string;
  withWrapper?: boolean;
  withFlex?: boolean;
}

/**
 * Output status display for result JSON
 */
export function OutputStatus({
  outputValue,
  outputError,
  validExtra,
  showValidLabel = true,
  className = "",
  withWrapper = false,
  withFlex = false,
}: OutputStatusProps) {
  const wrapperClass = withWrapper
    ? `text-xs h-4 ${withFlex ? "flex items-center gap-1" : ""}`
    : "";

  const content = (() => {
    if (outputError) {
      return (
        <span className={`text-red-400 flex items-center gap-1 ${className}`}>
          <i className="fas fa-exclamation-circle"></i> {outputError}
        </span>
      );
    }

    if (outputValue.trim() === "") {
      return (
        <span className={`text-gray-400 ${className}`}>
          Esperando operación...
        </span>
      );
    }

    return (
      <>
        {showValidLabel && (
          <span
            className={`text-green-400 flex items-center gap-1 ${className}`}
          >
            <i className="fas fa-check-circle"></i> JSON válido
          </span>
        )}
        {validExtra}
      </>
    );
  })();

  if (withWrapper) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return content;
}

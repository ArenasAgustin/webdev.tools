import { memo } from "react";
import { StatusIndicator } from "./StatusIndicator";
import { Stats } from "./Stats";

interface InputEditorFooterProps {
  variant: "input";
  value: string;
  validationState: {
    isValid: boolean;
    error: { message: string } | null;
  };
  warning?: string | null;
  waitingLabel: string;
  validLabel: string;
  invalidLabel: string;
  stats: { lines: number; characters: number; bytes: number };
}

interface OutputEditorFooterProps {
  variant: "output";
  value: string;
  error: string | null;
  isProcessing?: boolean;
  stats: { lines: number; characters: number; bytes: number };
  comparisonBytes: number;
}

type EditorFooterProps = InputEditorFooterProps | OutputEditorFooterProps;

export const EditorFooter = memo(function EditorFooter(props: EditorFooterProps) {
  if (props.variant === "input") {
    return (
      <StatusIndicator
        value={props.value}
        isValid={props.validationState.isValid}
        error={props.validationState.error}
        warning={props.warning}
        waitingLabel={props.waitingLabel}
        validLabel={props.validLabel}
        invalidLabel={props.invalidLabel}
        withWrapper
        withFlex
        validExtra={
          <Stats
            lines={props.stats.lines}
            characters={props.stats.characters}
            bytes={props.stats.bytes}
            leadingSeparator
          />
        }
      />
    );
  }

  if (props.isProcessing) {
    return (
      <div className="text-xs h-4 flex items-center gap-1">
        <span className="text-yellow-400 flex items-center gap-1">
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Procesando...
        </span>
      </div>
    );
  }

  return (
    <StatusIndicator
      value={props.value}
      error={props.error}
      waitingLabel="Esperando operación..."
      showValidLabel={false}
      withWrapper
      className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
      validExtra={
        <Stats
          lines={props.stats.lines}
          characters={props.stats.characters}
          bytes={props.stats.bytes}
          comparisonBytes={props.comparisonBytes}
        />
      }
    />
  );
});

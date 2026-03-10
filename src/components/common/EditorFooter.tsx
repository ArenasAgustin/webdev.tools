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

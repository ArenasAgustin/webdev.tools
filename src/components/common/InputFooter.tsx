import { memo } from "react";
import { ValidationStatus } from "./ValidationStatus";
import { Stats } from "./Stats";

interface InputFooterProps {
  inputValue: string;
  validationState: {
    isValid: boolean;
    error: { message: string } | null;
  };
  inputWarning?: string | null;
  waitingLabel: string;
  validLabel: string;
  invalidLabel: string;
  stats: { lines: number; characters: number; bytes: number };
}

export const InputFooter = memo(function InputFooter({
  inputValue,
  validationState,
  inputWarning,
  waitingLabel,
  validLabel,
  invalidLabel,
  stats,
}: InputFooterProps) {
  return (
    <ValidationStatus
      inputValue={inputValue}
      validationState={validationState}
      warning={inputWarning}
      waitingLabel={waitingLabel}
      validLabel={validLabel}
      invalidLabel={invalidLabel}
      withWrapper
      withFlex
      validExtra={
        <Stats
          lines={stats.lines}
          characters={stats.characters}
          bytes={stats.bytes}
          leadingSeparator
        />
      }
    />
  );
});

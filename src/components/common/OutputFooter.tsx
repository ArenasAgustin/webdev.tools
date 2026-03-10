import { memo } from "react";
import { OutputStatus } from "./OutputStatus";
import { Stats } from "./Stats";

interface OutputFooterProps {
  output: string;
  error: string | null;
  outputStats: { lines: number; characters: number; bytes: number };
  comparisonBytes: number;
}

export const OutputFooter = memo(function OutputFooter({
  output,
  error,
  outputStats,
  comparisonBytes,
}: OutputFooterProps) {
  return (
    <OutputStatus
      outputValue={output}
      outputError={error}
      showValidLabel={false}
      withWrapper
      className="min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
      validExtra={
        <Stats
          lines={outputStats.lines}
          characters={outputStats.characters}
          bytes={outputStats.bytes}
          comparisonBytes={comparisonBytes}
        />
      }
    />
  );
});

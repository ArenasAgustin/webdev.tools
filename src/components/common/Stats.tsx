import { memo } from "react";
import { useTranslation } from "react-i18next";
import { formatBytes } from "@/utils/formatBytes";

interface StatsProps {
  lines: number;
  characters: number;
  bytes: number;
  comparisonBytes?: number;
  leadingSeparator?: boolean;
  "data-testid"?: string;
}

/**
 * Text statistics display with optional size comparison
 * Memoized to prevent unnecessary re-renders
 */
export const Stats = memo(function Stats({
  lines,
  characters,
  bytes,
  comparisonBytes,
  leadingSeparator = false,
  "data-testid": dataTestId = undefined,
}: StatsProps) {
  const { t } = useTranslation();
  const hasComparison = comparisonBytes !== undefined && comparisonBytes > 0;

  const percentage = hasComparison
    ? Math.round(((comparisonBytes - bytes) / comparisonBytes) * 100)
    : 0;

  const isSmaller = hasComparison && bytes < comparisonBytes;

  const percentageColor =
    percentage > 0 ? "text-green-400" : percentage < 0 ? "text-red-400" : "text-gray-400";

  const percentageLabel = isSmaller ? t("stats.smaller") : t("stats.larger");

  return (
    <span className="text-gray-400" data-testid={dataTestId}>
      {leadingSeparator ? "· " : ""}
      {t("stats.summary", { lines, characters: characters.toLocaleString(), bytes: formatBytes(bytes) })}
      {hasComparison && (
        <span className={`ml-1 ${percentageColor}`}>
          ({Math.abs(percentage)}% {percentageLabel})
        </span>
      )}
    </span>
  );
});

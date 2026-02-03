interface StatsProps {
  lines: number;
  characters: number;
  bytes: number;
  comparisonBytes?: number;
}

/**
 * Text statistics display with optional size comparison
 */
export function Stats({
  lines,
  characters,
  bytes,
  comparisonBytes,
}: StatsProps) {
  const hasComparison = comparisonBytes !== undefined && comparisonBytes > 0;

  const percentage = hasComparison
    ? Math.round(((comparisonBytes - bytes) / comparisonBytes) * 100)
    : 0;

  const isSmaller = hasComparison && bytes < comparisonBytes;

  const percentageColor =
    percentage > 0
      ? "text-green-400"
      : percentage < 0
        ? "text-red-400"
        : "text-gray-400";

  const percentageLabel = isSmaller ? "más pequeño" : "más grande";

  return (
    <span className="text-gray-400">
      · {lines} líneas · {characters.toLocaleString()} caracteres ·{" "}
      {bytes.toLocaleString()} bytes
      {hasComparison && (
        <span className={`ml-1 ${percentageColor}`}>
          ({Math.abs(percentage)}% {percentageLabel})
        </span>
      )}
    </span>
  );
}

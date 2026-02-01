interface OutputStatsProps {
  outputBytes: number;
  inputBytes: number;
  lines: number;
  characters: number;
}

export function OutputStats({
  outputBytes,
  inputBytes,
  lines,
  characters,
}: OutputStatsProps) {
  const percentage =
    inputBytes > 0
      ? Math.round(((inputBytes - outputBytes) / inputBytes) * 100)
      : 0;
  const isSmaller = outputBytes < inputBytes;

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
      {outputBytes.toLocaleString()} bytes
      <span className={`ml-1 ${percentageColor}`}>
        ({Math.abs(percentage)}% {percentageLabel})
      </span>
    </span>
  );
}

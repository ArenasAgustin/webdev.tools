interface TextStatsProps {
  lines: number;
  characters: number;
  bytes: number;
}

export function TextStats({ lines, characters, bytes }: TextStatsProps) {
  return (
    <span className="text-gray-400">
      · {lines} líneas · {characters.toLocaleString()} caracteres ·{" "}
      {bytes.toLocaleString()} bytes
    </span>
  );
}

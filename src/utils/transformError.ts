export function compactTransformError(message: string, maxLength = 140): string {
  const firstLine = message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  const compact = (firstLine ?? message).replace(/\s{2,}/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 3)}...` : compact;
}

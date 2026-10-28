/**
 * i18n key for the empty output panel hint, naming only the actions the
 * playground actually offers (format is always available).
 */
export function outputIdleKey({
  hasMinify,
  hasExecute,
}: {
  hasMinify: boolean;
  hasExecute: boolean;
}): string {
  if (hasMinify && hasExecute) return "editor.outputIdle";
  if (hasExecute) return "editor.outputIdleFormatRun";
  if (hasMinify) return "editor.outputIdleFormatMinify";
  return "editor.outputIdleFormat";
}

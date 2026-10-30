/**
 * Whether code is a PHP file as written (it starts with inline HTML or an open
 * tag) rather than tagless PHP the runtime opens a tag for. PHP statements never
 * start with "<", so an open tag elsewhere (`echo "<?php";`) does not count.
 */
export function startsAsPhpFile(code: string): boolean {
  return /^\s*</.test(code);
}

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

export interface PasswordResult {
  password: string;
  strength: number;
  strengthLabel: string;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

/**
 * Calculate password strength (0-100)
 */
export function calculateStrength(
  password: string,
  options: PasswordOptions,
): { strength: number; label: string } {
  let score = 0;

  // Length contribution (2% per character, max 40%)
  score += Math.min(password.length * 2, 40);

  // Character type contributions
  if (options.includeUppercase) score += 10;
  if (options.includeLowercase) score += 10;
  if (options.includeNumbers) score += 15;
  if (options.includeSymbols) score += 25;

  // Bonus for using multiple character types
  const typesUsed = [
    options.includeUppercase,
    options.includeLowercase,
    options.includeNumbers,
    options.includeSymbols,
  ].filter(Boolean).length;

  if (typesUsed >= 3) score += 10;
  if (typesUsed === 4) score += 10;

  // Cap at 100
  score = Math.min(score, 100);

  let label: string;
  if (score < 40) label = "Débil";
  else if (score < 60) label = "Regular";
  else if (score < 80) label = "Buena";
  else label = "Fuerte";

  return { strength: score, label };
}

/**
 * Generate a secure random password
 */
export function generatePassword(options: PasswordOptions): string {
  let charset = "";

  if (options.includeUppercase) charset += UPPERCASE;
  if (options.includeLowercase) charset += LOWERCASE;
  if (options.includeNumbers) charset += NUMBERS;
  if (options.includeSymbols) charset += SYMBOLS;

  // Fallback if no options selected
  if (!charset) {
    charset = LOWERCASE;
  }

  /**
   * Unbiased random index using rejection sampling.
   * Discards values >= floor(2^32 / len) * len to eliminate modulo bias.
   */
  function unbiasedRandom(len: number): number {
    const limit = Math.floor(2 ** 32 / len) * len;
    const buf = new Uint32Array(1);
    let val: number;
    do {
      crypto.getRandomValues(buf);
      val = buf[0];
    } while (val >= limit);
    return val % len;
  }

  // Generate random password using crypto.getRandomValues (unbiased)
  let password = "";
  Array.from({ length: options.length }).forEach(() => {
    password += charset[unbiasedRandom(charset.length)];
  });

  // Ensure at least one character from each selected type
  const ensureCharacters: string[] = [];
  if (options.includeUppercase) {
    ensureCharacters.push(UPPERCASE[unbiasedRandom(UPPERCASE.length)]);
  }
  if (options.includeLowercase) {
    ensureCharacters.push(LOWERCASE[unbiasedRandom(LOWERCASE.length)]);
  }
  if (options.includeNumbers) {
    ensureCharacters.push(NUMBERS[unbiasedRandom(NUMBERS.length)]);
  }
  if (options.includeSymbols) {
    ensureCharacters.push(SYMBOLS[unbiasedRandom(SYMBOLS.length)]);
  }

  // If no character types selected, just return random password
  if (ensureCharacters.length === 0) {
    return password;
  }

  // Replace random positions with guaranteed characters (using unique positions).
  // Cap count to options.length to avoid an infinite loop when ensureCharacters
  // has more entries than available positions (e.g. length < number of char types).
  const passwordArray = password.split("");
  const usedPositions = new Set<number>();
  const count = Math.min(ensureCharacters.length, options.length);
  for (let i = 0; i < count; i++) {
    let pos: number;
    do {
      pos = unbiasedRandom(options.length);
    } while (usedPositions.has(pos));
    usedPositions.add(pos);
    passwordArray[pos] = ensureCharacters[i];
  }

  return passwordArray.join("");
}

/**
 * Generate password with strength calculation
 */
export function generatePasswordWithStrength(options: PasswordOptions): PasswordResult {
  const password = generatePassword(options);
  const { strength, label } = calculateStrength(password, options);

  return { password, strength, strengthLabel: label };
}

/**
 * Default options
 */
export const defaultPasswordOptions: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
};

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
  strengthLevel: StrengthLevel;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

export type StrengthLevel = "weak" | "fair" | "good" | "strong";

export const PASSWORD_LENGTH_MIN = 8;
export const PASSWORD_LENGTH_MAX = 128;
const PASSWORD_LENGTH_DEFAULT = 16;

/**
 * Keep a (possibly persisted or tampered) length inside the slider range:
 * rounds fractions, clamps to [min, max] and falls back to the default for
 * anything that is not a finite number.
 */
export function clampPasswordLength(length: number): number {
  if (typeof length !== "number" || !Number.isFinite(length)) {
    return PASSWORD_LENGTH_DEFAULT;
  }
  return Math.min(PASSWORD_LENGTH_MAX, Math.max(PASSWORD_LENGTH_MIN, Math.round(length)));
}

/**
 * Rate a password (0-100) from its own content: estimated entropy bits =
 * length * log2(size of the character pool it actually uses), capped at 100.
 * Levels: < 40 weak, < 60 fair, < 80 good, otherwise strong.
 */
export function calculateStrength(password: string): { strength: number; level: StrengthLevel } {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += LOWERCASE.length;
  if (/[A-Z]/.test(password)) pool += UPPERCASE.length;
  if (/[0-9]/.test(password)) pool += NUMBERS.length;
  if (/[^a-zA-Z0-9]/.test(password)) pool += SYMBOLS.length;

  const bits = pool > 0 ? password.length * Math.log2(pool) : 0;
  const strength = Math.min(Math.round(bits), 100);

  let level: StrengthLevel;
  if (strength < 40) level = "weak";
  else if (strength < 60) level = "fair";
  else if (strength < 80) level = "good";
  else level = "strong";

  return { strength, level };
}

/**
 * Generate a secure random password
 */
export function generatePassword(rawOptions: PasswordOptions): string {
  const options = { ...rawOptions, length: clampPasswordLength(rawOptions.length) };
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
  const { strength, level } = calculateStrength(password);

  return { password, strength, strengthLevel: level };
}

/**
 * Default options
 */
export const defaultPasswordOptions: PasswordOptions = {
  length: PASSWORD_LENGTH_DEFAULT,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
};

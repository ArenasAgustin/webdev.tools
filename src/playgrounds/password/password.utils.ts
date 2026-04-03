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

  // Generate random password using crypto.getRandomValues
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  let password = "";
  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Ensure at least one character from each selected type
  const ensureCharacters: string[] = [];
  if (options.includeUppercase) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % UPPERCASE.length;
    ensureCharacters.push(UPPERCASE[idx]);
  }
  if (options.includeLowercase) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % LOWERCASE.length;
    ensureCharacters.push(LOWERCASE[idx]);
  }
  if (options.includeNumbers) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % NUMBERS.length;
    ensureCharacters.push(NUMBERS[idx]);
  }
  if (options.includeSymbols) {
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % SYMBOLS.length;
    ensureCharacters.push(SYMBOLS[idx]);
  }

  // If no character types selected, just return random password
  if (ensureCharacters.length === 0) {
    return password;
  }

  // Replace random positions with guaranteed characters
  const passwordArray = password.split("");
  for (let i = 0; i < ensureCharacters.length && i < options.length; i++) {
    const pos = crypto.getRandomValues(new Uint32Array(1))[0] % options.length;
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

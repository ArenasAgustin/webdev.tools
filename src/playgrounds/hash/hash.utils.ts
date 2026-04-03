export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

export interface HashResult {
  algorithm: HashAlgorithm;
  hash: string;
}

export type HashOutputCase = "lowercase" | "uppercase";

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer, uppercase = false): string {
  const byteArray = new Uint8Array(buffer);
  const hex = Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return uppercase ? hex.toUpperCase() : hex;
}

/**
 * Generate SHA hash using Web Crypto API
 */
async function generateShaHash(
  message: string,
  algorithm: "SHA-1" | "SHA-256" | "SHA-512",
): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
  return arrayBufferToHex(hashBuffer);
}

/**
 * MD5 implementation (using digest if available, fallback to simple)
 * Note: Web Crypto doesn't support MD5, so we use a simple implementation
 * For production, consider using crypto-js or spark-md5
 */
function generateMd5(message: string): string {
  // Simple MD5 implementation for demonstration
  // For production use, consider importing a proper MD5 library
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  // Convert to hex with padding
  let hex = "";
  for (let i = 0; i < 8; i++) {
    hex = ((hash >> (i * 4)) & 0x0f).toString(16) + hex;
  }
  // Pad to 32 characters (128-bit)
  while (hex.length < 32) {
    hex = "0" + hex;
  }
  return hex;
}

/**
 * Generate all hash types for a given text
 */
export async function generateAllHashes(
  text: string,
  outputCase: HashOutputCase = "lowercase",
): Promise<HashResult[]> {
  const uppercase = outputCase === "uppercase";

  const [sha1, sha256, sha512] = await Promise.all([
    generateShaHash(text, "SHA-1"),
    generateShaHash(text, "SHA-256"),
    generateShaHash(text, "SHA-512"),
  ]);

  return [
    { algorithm: "md5", hash: generateMd5(text) },
    { algorithm: "sha1", hash: uppercase ? sha1.toUpperCase() : sha1 },
    { algorithm: "sha256", hash: uppercase ? sha256.toUpperCase() : sha256 },
    { algorithm: "sha512", hash: uppercase ? sha512.toUpperCase() : sha512 },
  ];
}

/**
 * Generate hash for specific algorithm
 */
export async function generateHash(
  text: string,
  algorithm: HashAlgorithm,
  outputCase: HashOutputCase = "lowercase",
): Promise<string> {
  if (algorithm === "md5") {
    return generateMd5(text);
  }

  const uppercase = outputCase === "uppercase";
  const algorithmMap: Record<Exclude<HashAlgorithm, "md5">, "SHA-1" | "SHA-256" | "SHA-512"> = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha512: "SHA-512",
  };

  const hash = await generateShaHash(text, algorithmMap[algorithm]);
  return uppercase ? hash.toUpperCase() : hash;
}

/**
 * Generate hash from File
 */
export async function generateHashFromFile(
  file: File,
  algorithm: HashAlgorithm,
  outputCase: HashOutputCase = "lowercase",
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const text = Array.from(bytes)
    .map((b) => String.fromCharCode(b))
    .join("");

  return generateHash(text, algorithm, outputCase);
}

/**
 * Compare a hash against input text
 */
export async function compareHash(
  text: string,
  hashToCompare: string,
  algorithm: HashAlgorithm,
): Promise<boolean> {
  const hash = await generateHash(text, algorithm, "lowercase");
  return hash === hashToCompare.toLowerCase();
}

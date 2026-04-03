import { describe, it, expect } from "vitest";
import {
  generatePassword,
  generatePasswordWithStrength,
  calculateStrength,
  defaultPasswordOptions,
} from "./password.utils";

describe("password.utils", () => {
  describe("generatePassword", () => {
    it("generates password with default length", () => {
      const password = generatePassword(defaultPasswordOptions);
      expect(password).toHaveLength(16);
    });

    it("generates password with custom length", () => {
      const password = generatePassword({ ...defaultPasswordOptions, length: 32 });
      expect(password).toHaveLength(32);
    });

    it("includes uppercase when enabled", () => {
      const password = generatePassword({
        length: 100,
        includeUppercase: true,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(password).toMatch(/[A-Z]/);
    });

    it("includes lowercase when enabled", () => {
      const password = generatePassword({
        length: 100,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(password).toMatch(/[a-z]/);
    });

    it("includes numbers when enabled", () => {
      const password = generatePassword({
        length: 100,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
      });
      expect(password).toMatch(/[0-9]/);
    });

    it("includes symbols when enabled", () => {
      const password = generatePassword({
        length: 100,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: true,
      });
      expect(password).toMatch(/[!@#$%^&*()_+=[\]{}|;':",.<>?]/);
    });

    it("falls back to lowercase when no options selected", () => {
      const password = generatePassword({
        length: 16,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(password).toHaveLength(16);
      expect(password).toMatch(/[a-z]/);
    });
  });

  describe("generatePasswordWithStrength", () => {
    it("returns password and strength", () => {
      const result = generatePasswordWithStrength(defaultPasswordOptions);
      expect(result.password).toHaveLength(16);
      expect(result.strength).toBeGreaterThan(0);
      expect(result.strengthLabel).toBeDefined();
    });

    it("returns stronger password with more character types", () => {
      const basic = generatePasswordWithStrength({
        length: 16,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false,
      });

      const complex = generatePasswordWithStrength({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });

      expect(complex.strength).toBeGreaterThan(basic.strength);
    });
  });

  describe("calculateStrength", () => {
    it("returns weak for short passwords", () => {
      const result = calculateStrength("abc", {
        length: 3,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: false,
        includeSymbols: false,
      });
      expect(result.strength).toBeLessThan(40);
      expect(result.label).toBe("Débil");
    });

    it("returns regular for medium passwords", () => {
      const result = calculateStrength("abcd1234", {
        length: 8,
        includeUppercase: false,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
      });
      expect(result.strength).toBeGreaterThanOrEqual(40);
      expect(result.strength).toBeLessThan(60);
      expect(result.label).toBe("Regular");
    });

    it("returns strong for longer passwords with mixed types", () => {
      const result = calculateStrength("Abcd1234!@#$", {
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      expect(result.strength).toBeGreaterThanOrEqual(60);
      expect(result.label).toMatch(/Buena|Fuerte/);
    });

    it("caps strength at 100", () => {
      const result = calculateStrength("VeryLongPasswordWithManyTypes123!@#", {
        length: 50,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
      });
      expect(result.strength).toBeLessThanOrEqual(100);
    });
  });
});

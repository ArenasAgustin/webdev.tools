// @vitest-environment node
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
      expect(result.strengthLevel).toBeDefined();
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
    it("rates the password content, not the generator options", () => {
      expect(calculateStrength("abc")).toEqual(calculateStrength("abc"));
      expect(calculateStrength("abc").level).toBe("weak");
    });

    it("rates very short passwords as weak even with every character type", () => {
      const result = calculateStrength("a1");
      expect(result.level).toBe("weak");
      expect(result.strength).toBeLessThan(40);
    });

    it("rates 8 mixed characters as fair and 16 as strong", () => {
      expect(calculateStrength("Ab1!cD2@").level).toBe("fair");
      expect(calculateStrength("Ab1!cD2@eF3#gH4$").level).toBe("strong");
    });

    it("rates 12 mixed characters as good", () => {
      expect(calculateStrength("Ab1!cD2@eF3#").level).toBe("good");
    });

    it("grows with length and character variety and caps at 100", () => {
      expect(calculateStrength("abcdefgh").strength).toBeLessThan(
        calculateStrength("Ab1!cD2@").strength,
      );
      expect(calculateStrength("Ab1!".repeat(20)).strength).toBe(100);
    });
  });
});

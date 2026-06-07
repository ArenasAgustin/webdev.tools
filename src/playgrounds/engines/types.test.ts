import { describe, it, expectTypeOf } from "vitest";
import type { PlaygroundMode, MonacoLanguage, PlaygroundFeature } from "./types";

describe("Types", () => {
  describe("PlaygroundMode", () => {
    it("includes 'php' as a valid mode", () => {
      // If "php" is in PlaygroundMode, this should be true
      type IsPhpInMode = "php" extends PlaygroundMode ? true : false;
      expectTypeOf<IsPhpInMode>().toEqualTypeOf<true>();
    });

    it("includes all existing modes", () => {
      type AllModes = "json" | "js" | "html" | "css" | "php" | "sql";
      expectTypeOf<PlaygroundMode>().toEqualTypeOf<AllModes>();
    });

    it("includes 'sql' as a valid mode", () => {
      type IsSqlInMode = "sql" extends PlaygroundMode ? true : false;
      expectTypeOf<IsSqlInMode>().toEqualTypeOf<true>();
    });
  });

  describe("MonacoLanguage", () => {
    it("includes 'php' as a valid language", () => {
      type IsPhpInLang = "php" extends MonacoLanguage ? true : false;
      expectTypeOf<IsPhpInLang>().toEqualTypeOf<true>();
    });

    it("includes all expected languages", () => {
      type AllLangs = "json" | "javascript" | "html" | "css" | "php" | "sql";
      expectTypeOf<MonacoLanguage>().toEqualTypeOf<AllLangs>();
    });

    it("includes 'sql' as a valid language", () => {
      type IsSqlInLang = "sql" extends MonacoLanguage ? true : false;
      expectTypeOf<IsSqlInLang>().toEqualTypeOf<true>();
    });
  });

  describe("PlaygroundFeature", () => {
    it("allows 'validate' as a feature for PHP", () => {
      type IsValidateInFeature = "validate" extends PlaygroundFeature ? true : false;
      expectTypeOf<IsValidateInFeature>().toEqualTypeOf<true>();
    });

    it("allows 'minify' as a feature", () => {
      type IsMinifyInFeature = "minify" extends PlaygroundFeature ? true : false;
      expectTypeOf<IsMinifyInFeature>().toEqualTypeOf<true>();
    });

    it("includes all existing features", () => {
      type AllFeatures = "clean" | "execute" | "preview" | "jsonPath" | "validate" | "minify";
      expectTypeOf<PlaygroundFeature>().toEqualTypeOf<AllFeatures>();
    });
  });
});

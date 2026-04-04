import { describe, it, expect } from "vitest";
import { phpService } from "@/services/php/service";

describe("phpService", () => {
  it("should have format function", () => {
    expect(typeof phpService.format).toBe("function");
  });

  it("should have validate function", () => {
    expect(typeof phpService.validate).toBe("function");
  });

  it("should have minify function (stub that returns error)", () => {
    expect(typeof phpService.minify).toBe("function");
  });

  it("format should format valid PHP code", async () => {
    const input = "<?php function test(){return 1;}";
    const result = await phpService.format(input, { indentSize: 2 });

    expect(result.ok).toBe(true);
  });

  it("validate should return valid for correct PHP", async () => {
    const result = await phpService.validate('<?php echo "hello";');

    expect(result.ok).toBe(true);
  });

  it("validate should return invalid for empty input", async () => {
    const result = await phpService.validate("   ");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTypeOf("string");
    }
  });

  it("minify should return error (not supported for PHP)", async () => {
    const result = await phpService.minify('<?php echo "hello";');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTypeOf("string");
    }
  });

  it("format should handle complex PHP with classes", async () => {
    const input = `<?php
class Test{public function run(){return true;}}`;
    const result = await phpService.format(input, { indentSize: 2 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("class Test");
      expect(result.value).toContain("public function run()");
    }
  });

  it("validate should handle PHP with variables and expressions", async () => {
    const input = "<?php $x = 1 + 2; echo $x;";
    const result = await phpService.validate(input);

    expect(result.ok).toBe(true);
  });
});

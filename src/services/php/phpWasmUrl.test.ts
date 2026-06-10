import { describe, it, expect } from "vitest";
import { phpWasmLocateFile } from "./phpWasmUrl";

describe("phpWasmLocateFile", () => {
  const origin = "https://webdev.tools";

  it("builds a same-origin URL for the asyncify wasm", () => {
    expect(phpWasmLocateFile("asyncify", "7_4_33/php_7_4.wasm", origin)).toBe(
      "https://webdev.tools/php-wasm/7-4/asyncify/7_4_33/php_7_4.wasm",
    );
  });

  it("builds a same-origin URL for the jspi wasm", () => {
    expect(phpWasmLocateFile("jspi", "7_4_33/php_7_4.wasm", origin)).toBe(
      "https://webdev.tools/php-wasm/7-4/jspi/7_4_33/php_7_4.wasm",
    );
  });

  it("only rewrites .wasm files, leaving other resources to the default loader", () => {
    expect(phpWasmLocateFile("asyncify", "php_7_4.js", origin)).toBeNull();
  });

  it("does not duplicate slashes when origin has a trailing slash", () => {
    expect(phpWasmLocateFile("asyncify", "7_4_33/php_7_4.wasm", "https://webdev.tools/")).toBe(
      "https://webdev.tools/php-wasm/7-4/asyncify/7_4_33/php_7_4.wasm",
    );
  });
});

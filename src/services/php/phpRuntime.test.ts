import { describe, it, expect, vi, beforeEach } from "vitest";

const { run, setPhpIniEntries } = vi.hoisted(() => ({
  run: vi.fn(),
  setPhpIniEntries: vi.fn(),
}));

vi.mock("@php-wasm/web", () => ({ loadWebRuntime: vi.fn(() => Promise.resolve(1)) }));
vi.mock("@php-wasm/universal", () => ({
  PHP: class {
    run = run;
  },
  setPhpIniEntries,
}));

import { executePhp } from "./phpRuntime";
import { serviceMessage } from "@/services/serviceMessage";

/** Shape of what php-wasm returns, or throws on a non-zero exit code. */
const response = (text: string, exitCode = 0) => ({ text, errors: "", exitCode });
const failure = (text: string, exitCode = 255) =>
  Object.assign(new Error(`PHP.run() failed with exit code ${exitCode}.\n\n=== Stdout ===\n ...`), {
    response: response(text, exitCode),
  });

describe("executePhp", () => {
  beforeEach(() => {
    run.mockReset();
    setPhpIniEntries.mockReset();
  });

  it("runs code that starts with inline HTML as written", async () => {
    run.mockResolvedValue(response("<h1>Hi</h1>\n2"));
    const code = "<h1>Hi</h1>\n<?php echo 1 + 1; ?>";

    await executePhp(code);

    expect(run).toHaveBeenCalledWith({ code });
  });

  it("opens a PHP tag for tagless code without shifting line numbers", async () => {
    run.mockResolvedValue(response("1"));

    await executePhp("echo 1;\necho 2;");

    expect(run).toHaveBeenCalledWith({ code: "<?php echo 1;\necho 2;" });
  });

  it("runs tagless code whose string holds an open tag as PHP, not inline HTML", async () => {
    run.mockResolvedValue(response("<?php"));

    await executePhp('echo "<?php";');

    expect(run).toHaveBeenCalledWith({ code: '<?php echo "<?php";' });
  });

  it("keeps leading blank lines so error line numbers match the editor", async () => {
    run.mockResolvedValue(response("1"));

    await executePhp("\n\necho 1;");
    expect(run).toHaveBeenLastCalledWith({ code: "<?php \n\necho 1;" });

    // Before an open tag the blank lines move inside it, so they print nothing.
    await executePhp("\n\n<?php echo 1;");
    expect(run).toHaveBeenLastCalledWith({ code: "<?php\n\n echo 1;" });
  });

  it("reports warnings as plain text, in order with the output", async () => {
    run.mockResolvedValue(
      response("a\nNotice: Undefined variable: undef in /internal/eval.php on line 2\nb"),
    );

    const result = await executePhp('echo "a";\necho $undef;\necho "b";');

    expect(setPhpIniEntries).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ html_errors: "0", log_errors: "0" }),
    );
    expect(result).toEqual({
      ok: true,
      value: "a\nNotice: Undefined variable: undef on line 2\nb",
    });
  });

  it("reports a fatal error as one plain line and keeps the output printed before it", async () => {
    run.mockRejectedValue(
      failure(
        "before\n\nFatal error: Uncaught Error: Call to undefined function nope() in /internal/eval.php:2\nStack trace:\n#0 {main}\n  thrown in /internal/eval.php on line 2\n",
      ),
    );

    const result = await executePhp('echo "before\n";\nnope();');

    expect(result).toEqual({
      ok: false,
      error: {
        message: "Fatal error: Uncaught Error: Call to undefined function nope() on line 2",
        output: "before\n",
      },
    });
  });

  it("reports a parse error without output", async () => {
    run.mockRejectedValue(
      failure("\nParse error: syntax error, unexpected ';' in /internal/eval.php on line 2\n"),
    );

    const result = await executePhp("echo 1;\n$a = ;");

    expect(result).toEqual({
      ok: false,
      error: { message: "Parse error: syntax error, unexpected ';' on line 2" },
    });
  });

  it("keeps the output of a script that exits with a non-zero code", async () => {
    run.mockRejectedValue(failure("hello\n", 1));

    const result = await executePhp('echo "hello\n"; exit(1);');

    expect(result).toEqual({
      ok: false,
      error: { message: serviceMessage("services.php.exitCode", { code: 1 }), output: "hello\n" },
    });
  });

  it("reports a silent non-zero exit without php-wasm's internal dump", async () => {
    run.mockRejectedValue(failure("", 3));

    const result = await executePhp("exit(3);");

    expect(result).toEqual({
      ok: false,
      error: { message: serviceMessage("services.php.exitCode", { code: 3 }) },
    });
  });
});

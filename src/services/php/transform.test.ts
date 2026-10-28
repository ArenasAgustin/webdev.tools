// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parsePhp, formatPhp, validatePhp } from "@/services/php/transform";

describe("parsePhp", () => {
  it("should parse valid PHP code and return AST", () => {
    const input = '<?php echo "hello";';
    const result = parsePhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBeDefined();
      expect(result.value).toHaveProperty("kind", "program");
    }
  });

  it("should return error for invalid PHP syntax", () => {
    const input = "<?php echo ";
    const result = parsePhp(input);

    expect(result.ok).toBe(false);
  });

  it("should parse complex PHP code with classes and functions", () => {
    const input = `<?php
class Greeter {
  public function greet($name) {
    return "Hello, " . $name;
  }
}
$g = new Greeter();
echo $g->greet("World");
`;
    const result = parsePhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveProperty("kind", "program");
      const children = result.value as { children?: unknown[] };
      expect(Array.isArray(children.children)).toBe(true);
      expect(children.children?.length).toBeGreaterThan(0);
    }
  });
});

describe("formatPhp", () => {
  it("reports a syntax error instead of formatting invalid PHP", () => {
    const result = formatPhp("<?php\nif ($a {\n  echo 1;\n}");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/^services\.php\.syntaxErrorAtLine/);
  });

  it("should format unindented PHP code with default indentation", () => {
    const input = `<?php
function hello($name){return "Hello, ".$name;}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("function hello($name)");
      expect(result.value).toContain("return");
    }
  });

  it("returns empty output for empty input", () => {
    const result = formatPhp("   ");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe("");
    }
  });

  it("returns error for invalid PHP syntax", () => {
    const input = "<?php echo ";
    const result = formatPhp(input);

    expect(result.ok).toBe(false);
  });

  it("formats with custom indentation (4 spaces)", () => {
    const input = `<?php
function test(){
return 1;
}`;
    const result = formatPhp(input, 4);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("    return");
    }
  });

  it("formats with tabs", () => {
    const input = `<?php
function test(){
return 1;
}`;
    const result = formatPhp(input, "\t");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("\treturn");
    }
  });

  // Test uncovered branches
  it("handles line starting with closing brace", () => {
    const input = `<?php
function test() {
}
echo "done";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("}");
    }
  });

  it("handles line with closing brace and more content", () => {
    const input = `<?php
function test() { return 1; }`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles else keyword on same line", () => {
    const input = `<?php
if ($x) {
  echo "a";
} else {
  echo "b";
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toContain("else");
    }
  });

  it("handles elseif keyword on same line", () => {
    const input = `<?php
if ($x) {
  echo "a";
} elseif ($y) {
  echo "b";
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles catch keyword on same line", () => {
    const input = `<?php
try {
  echo "a";
} catch (Exception $e) {
  echo "b";
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles return statement with semicolon", () => {
    const input = `<?php
function test() {
return 1;
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("keeps code after an early return/break at the block's indent", () => {
    const input = `<?php
function test($a) {
if ($a) {
return;
}
foreach ($a as $x) {
if ($x) {
break;
}
echo $x;
}
return 1;
}
echo "end";`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
function test($a) {
  if ($a) {
    return;
  }
  foreach ($a as $x) {
    if ($x) {
      break;
    }
    echo $x;
  }
  return 1;
}
echo "end";`,
    });
  });

  it("does not drift indentation on ${var} interpolation", () => {
    const input = `<?php
if ($a) {
echo "Hi \${name}!";
echo "x";
}
echo "end";`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
if ($a) {
  echo "Hi \${name}!";
  echo "x";
}
echo "end";`,
    });
  });

  it("ignores braces inside single-line block comments", () => {
    const input = `<?php
if ($a) { /* { */
echo "x";
}
echo "end"; /* } */
echo "after";`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
if ($a) { /* { */
  echo "x";
}
echo "end"; /* } */
echo "after";`,
    });
  });

  it("ignores braces inside multi-line block comments", () => {
    const input = `<?php
/* Usage: if ($x) {
while (true) {
*/
if ($a) {
echo "x";
}
echo "end";`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
/* Usage: if ($x) {
while (true) {
*/
if ($a) {
  echo "x";
}
echo "end";`,
    });
  });

  it("handles throw statement", () => {
    const input = `<?php
if ($error) {
throw new Exception("error");
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles break statement", () => {
    const input = `<?php
foreach ($items as $item) {
break;
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles continue statement", () => {
    const input = `<?php
foreach ($items as $item) {
continue;
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles goto statement", () => {
    const input = `<?php
goto label;
label:
echo "done";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("removes trailing empty lines", () => {
    const input = `<?php
echo "test";

`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.endsWith("\n")).toBe(false);
    }
  });

  it("handles heredoc syntax correctly", () => {
    const input = `<?php
$sql = <<<SQL
SELECT * FROM users
WHERE id = {$userId}
AND status = 'active';
SQL;
echo "done";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The heredoc content should NOT affect brace counting
      expect(result.value).toContain("SELECT * FROM users");
      expect(result.value).toContain('echo "done";');
    }
  });

  it("handles nowdoc syntax correctly", () => {
    const input = `<?php
$code = <<<'CODE'
function test() {
  return "nested {$value}";
}
CODE;
echo "end";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Nowdoc content preserved, outer braces handled correctly
      expect(result.value).toContain("function test()");
      expect(result.value).toContain('echo "end";');
    }
  });

  it("keeps heredoc bodies verbatim inside an indented block", () => {
    const input = `<?php
function render() {
$html = <<<EOT
  <div>
      {$name}
  </div>
EOT;
return $html;
}`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
function render() {
  $html = <<<EOT
  <div>
      {$name}
  </div>
EOT;
  return $html;
}`,
    });
  });

  it("keeps nowdoc bodies verbatim when passed as an argument", () => {
    const input = `<?php
if ($x) {
echo strtoupper(<<<'TXT'
   a { b
TXT);
echo "after";
}`;
    const result = formatPhp(input);

    expect(result).toEqual({
      ok: true,
      value: `<?php
if ($x) {
  echo strtoupper(<<<'TXT'
   a { b
TXT);
  echo "after";
}`,
    });
  });

  it("handles interpolated strings with {$var}", () => {
    const input = `<?php
$name = "test";
echo "Hello {$name}!";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The {$name} should not be counted as a brace
      expect(result.value).toContain('echo "Hello {$name}!";');
    }
  });

  it("handles block comments with braces", () => {
    const input = `<?php
function test() {
  /* This is a { block } comment */
  return 1;
}`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // Block comment with braces should not affect indentation
      expect(result.value).toContain("/* This is a { block } comment */");
    }
  });

  it("handles nested interpolation in strings", () => {
    const input = `<?php
$arr = ["key" => "value"];
echo "{$arr["key"]}";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
  });

  it("handles heredoc with closing brace in content", () => {
    const input = `<?php
$template = <<<HTML
<div class="container">
  <p>Message}</p>
</div>
HTML;
echo "done";`;
    const result = formatPhp(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The } inside heredoc should not close the function
      expect(result.value).toContain('echo "done";');
    }
  });
});

describe("validatePhp", () => {
  it("should return valid for correct PHP code", () => {
    const input = '<?php echo "hello";';
    const result = validatePhp(input);

    expect(result.ok).toBe(true);
  });

  it("should return invalid with error for bad PHP syntax", () => {
    const input = "<?php echo ";
    const result = validatePhp(input);

    expect(result.ok).toBe(false);
  });

  it("should return invalid for empty input", () => {
    const result = validatePhp("   ");

    expect(result.ok).toBe(false);
  });
});

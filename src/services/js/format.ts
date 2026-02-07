import { type Result } from "@/types/common";

type TokenType =
  | "word"
  | "number"
  | "string"
  | "template"
  | "comment"
  | "punct"
  | "operator";

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Format JavaScript code - add proper indentation and spacing
 * Pure function - no side effects
 */
export function formatJs(
  input: string,
  indentSize: number = 2,
): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const tokens = tokenize(input);
    const indent = " ".repeat(indentSize);
    let indentLevel = 0;
    let output = "";
    let atLineStart = true;
    let prev: Token | null = null;

    const spacedOperators = new Set([
      "=",
      "==",
      "===",
      "!=",
      "!==",
      "<",
      ">",
      "<=",
      ">=",
      "+",
      "-",
      "*",
      "/",
      "%",
      "&&",
      "||",
      "=>",
    ]);
    const noSpaceOperators = new Set(["++", "--", "!", "~"]);

    const ensureIndent = () => {
      if (atLineStart) {
        output += indent.repeat(indentLevel);
        atLineStart = false;
      }
    };

    const newLine = () => {
      output = output.trimEnd() + "\n";
      atLineStart = true;
    };

    const needsSpace = (previous: Token | null, current: Token) => {
      if (!previous) return false;
      if (previous.type === "comment") return true;
      if (current.value === "(" && previous.type === "word") return false;
      if (
        current.value === "[" &&
        (previous.type === "word" || previous.type === "number")
      )
        return false;
      if (current.value === "." || previous.value === ".") return false;
      const wordish = new Set([
        "word",
        "number",
        "string",
        "template",
      ] as TokenType[]);
      if (wordish.has(previous.type) && wordish.has(current.type)) return true;
      if (previous.value === ")" && current.type === "word") return true;
      return false;
    };

    for (const token of tokens) {
      if (token.type === "comment") {
        if (!atLineStart) {
          newLine();
        }
        ensureIndent();
        output += token.value.trimEnd();
        newLine();
        prev = null;
        continue;
      }

      if (token.value === "{") {
        if (needsSpace(prev, token)) {
          output += " ";
        }
        ensureIndent();
        output += "{";
        newLine();
        indentLevel++;
        prev = token;
        continue;
      }

      if (token.value === "}") {
        if (!atLineStart) {
          newLine();
        }
        indentLevel = Math.max(0, indentLevel - 1);
        ensureIndent();
        output += "}";
        newLine();
        prev = token;
        continue;
      }

      if (token.value === ";") {
        ensureIndent();
        output += ";";
        newLine();
        prev = token;
        continue;
      }

      if (token.value === ",") {
        ensureIndent();
        output += ", ";
        prev = token;
        continue;
      }

      if (token.value === ":") {
        ensureIndent();
        output += ": ";
        prev = token;
        continue;
      }

      if (token.type === "operator") {
        ensureIndent();
        if (spacedOperators.has(token.value)) {
          if (!output.endsWith(" ") && !atLineStart) output += " ";
          output += token.value + " ";
        } else if (noSpaceOperators.has(token.value)) {
          output += token.value;
        } else {
          output += token.value;
        }
        prev = token;
        continue;
      }

      if (needsSpace(prev, token)) {
        output += " ";
      }
      ensureIndent();
      output += token.value;
      prev = token;
    }

    return {
      ok: true,
      value: output
        .trim()
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0)
        .join("\n"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const operators = [
    "===",
    "!==",
    ">>>",
    "<<=",
    ">>=",
    "**=",
    "=>",
    "==",
    "!=",
    "<=",
    ">=",
    "&&",
    "||",
    "++",
    "--",
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "**",
    "<<",
    ">>",
    "=",
    "+",
    "-",
    "*",
    "/",
    "%",
    "<",
    ">",
    "!",
    "&",
    "|",
    "^",
    "~",
    "?",
  ];
  const punct = new Set(["{", "}", "(", ")", "[", "]", ";", ",", ".", ":"]);

  let i = 0;
  while (i < input.length) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (/\s/.test(char)) {
      i++;
      continue;
    }

    if (char === "/" && nextChar === "/") {
      let value = "//";
      i += 2;
      while (i < input.length && input[i] !== "\n") {
        value += input[i++];
      }
      tokens.push({ type: "comment", value });
      continue;
    }

    if (char === "/" && nextChar === "*") {
      let value = "/*";
      i += 2;
      while (i < input.length) {
        value += input[i];
        if (input[i] === "*" && input[i + 1] === "/") {
          value += input[i + 1];
          i += 2;
          break;
        }
        i++;
      }
      tokens.push({ type: "comment", value });
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      const stringChar = char;
      let value = char;
      i++;
      while (i < input.length) {
        value += input[i];
        if (input[i] === stringChar && input[i - 1] !== "\\") {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ type: char === "`" ? "template" : "string", value });
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      let value = char;
      i++;
      while (i < input.length && /[A-Za-z0-9_$]/.test(input[i])) {
        value += input[i++];
      }
      tokens.push({ type: "word", value });
      continue;
    }

    if (/\d/.test(char)) {
      let value = char;
      i++;
      while (i < input.length && /[\d.]/.test(input[i])) {
        value += input[i++];
      }
      tokens.push({ type: "number", value });
      continue;
    }

    const op = operators.find((candidate) => input.startsWith(candidate, i));
    if (op) {
      tokens.push({ type: "operator", value: op });
      i += op.length;
      continue;
    }

    if (punct.has(char)) {
      tokens.push({ type: "punct", value: char });
      i++;
      continue;
    }

    tokens.push({ type: "punct", value: char });
    i++;
  }

  return tokens;
}

import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { formatWithPrettier } from "@/services/formatter/prettier";
import { minify_sync as terserMinifySync } from "terser";
import * as babelParser from "@babel/parser";
import type { Node as BabelNode } from "@babel/types";

export interface JsFormatOptions {
  indentSize?: IndentStyle;
}

export interface JsMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

export interface JsCleanOptions {
  removeEmptyObject?: boolean;
  removeEmptyArray?: boolean;
  removeEmptyFunction?: boolean;
  removeEmptyString?: boolean;
}

interface TerserSyncResult {
  code?: string;
}

type TerserSyncMinifyFn = (
  input: string,
  options: {
    compress: boolean;
    mangle: boolean;
    format: {
      comments: boolean;
      beautify: boolean;
    };
  },
) => TerserSyncResult | null | undefined;

export async function formatJs(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "babel", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al formatear código" };
  }
}

export function minifyJs(input: string, options: JsMinifyOptions = {}): Result<string, string> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const { removeComments = true, removeSpaces = true } = options;

    const minifySyncUnknown: unknown = terserMinifySync;
    if (typeof minifySyncUnknown !== "function") {
      return { ok: false, error: "Terser minify no está disponible" };
    }

    const minifySync = minifySyncUnknown as TerserSyncMinifyFn;

    const result = minifySync(input, {
      compress: removeSpaces,
      mangle: removeSpaces,
      format: {
        comments: !removeComments,
        beautify: !removeSpaces,
      },
    });

    const code = typeof result?.code === "string" ? result.code : "";
    return { ok: true, value: code.trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

const JS_ERROR_MESSAGES = {
  EMPTY_INPUT: "El código JavaScript está vacío",
  PARSE_ERROR: "No se pudo parsear el código JavaScript",
} as const;

/**
 * Represents a range in the source code to remove
 */
interface RangeToRemove {
  start: number;
  end: number;
}

/**
 * Check whether a node is an empty construct enabled by the clean options:
 * "", [], {}, or a function with an empty block body.
 */
function isEmptyConstruct(node: BabelNode | null | undefined, options: JsCleanOptions): boolean {
  if (!node) return false;

  switch (node.type) {
    case "ObjectExpression":
      return !!options.removeEmptyObject && node.properties.length === 0;
    case "ArrayExpression":
      return !!options.removeEmptyArray && node.elements.length === 0;
    case "StringLiteral":
      return !!options.removeEmptyString && node.value === "";
    case "FunctionExpression":
    case "ArrowFunctionExpression":
    case "FunctionDeclaration":
      return (
        !!options.removeEmptyFunction &&
        node.body.type === "BlockStatement" &&
        node.body.body.length === 0
      );
    default:
      return false;
  }
}

/**
 * Check if an empty construct can be removed from where it sits.
 * Only contexts whose removal leaves valid code are allowed:
 * - Variable initializers (the declarator or whole declaration is removed)
 * - Standalone statements and assignment statements
 * - Return values
 * - Array elements (removed together with their comma)
 * - Function declarations in a statement list
 * Object property values, call arguments and operands are kept: removing
 * them would leave invalid syntax or change the meaning of the code.
 */
function isRemovableValue(
  node: BabelNode,
  parent: BabelNode | null,
  key: string,
  grandparent: BabelNode | null,
): boolean {
  if (!parent) return true;

  switch (parent.type) {
    case "VariableDeclarator":
      return key === "init" && grandparent?.type === "VariableDeclaration";
    case "ExpressionStatement":
    case "ReturnStatement":
    case "ArrayExpression":
      return true;
    case "AssignmentExpression":
      return key === "right" && grandparent?.type === "ExpressionStatement";
    case "Program":
    case "BlockStatement":
      return node.type === "FunctionDeclaration";
    default:
      return false;
  }
}

/**
 * Range of one item in a comma-separated list, including the comma that
 * separates it from its neighbour so no hole is left behind.
 */
function listItemRange(list: (BabelNode | null)[], item: BabelNode): RangeToRemove {
  const index = list.indexOf(item);
  const next = list[index + 1];
  const previous = list[index - 1];

  if (next) {
    return { start: item.start ?? 0, end: next.start ?? item.end ?? 0 };
  }
  if (previous) {
    return { start: previous.end ?? item.start ?? 0, end: item.end ?? 0 };
  }
  return { start: item.start ?? 0, end: item.end ?? 0 };
}

/**
 * Range of source to remove for an empty construct in a removable context.
 */
function removalRange(
  node: BabelNode,
  parent: BabelNode | null,
  grandparent: BabelNode | null,
  options: JsCleanOptions,
): RangeToRemove {
  if (parent?.type === "VariableDeclarator" && grandparent?.type === "VariableDeclaration") {
    const allEmpty = grandparent.declarations.every((declarator) =>
      isEmptyConstruct(declarator.init, options),
    );
    return allEmpty
      ? { start: grandparent.start ?? 0, end: grandparent.end ?? 0 }
      : listItemRange(grandparent.declarations, parent);
  }

  if (parent?.type === "ArrayExpression") {
    return listItemRange(parent.elements, node);
  }

  if (parent?.type === "AssignmentExpression" && grandparent) {
    return { start: grandparent.start ?? 0, end: grandparent.end ?? 0 };
  }

  return { start: node.start ?? 0, end: node.end ?? 0 };
}

/**
 * Merge overlapping or touching ranges and sort them from end to start, so
 * they can be removed without shifting the indices of the remaining ones.
 */
function mergeRanges(ranges: RangeToRemove[]): RangeToRemove[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: RangeToRemove[] = [];

  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged.reverse();
}

/**
 * Parse JavaScript code and find empty constructs using Babel AST
 */
function findEmptyConstructs(input: string, options: JsCleanOptions): RangeToRemove[] {
  const ranges: RangeToRemove[] = [];

  let ast: babelParser.ParseResult | null;
  try {
    ast = babelParser.parse(input, {
      sourceType: "module",
      plugins: ["jsx", "typescript"],
      errorRecovery: true,
    });
  } catch {
    // If parsing fails, return empty array (fallback to original input)
    return ranges;
  }

  if (!ast) {
    return ranges;
  }

  /**
   * Walk the AST and find empty constructs
   */
  function walk(
    node: BabelNode | null | undefined,
    parent: BabelNode | null,
    parentKey: string,
    grandparent: BabelNode | null = null,
  ): void {
    if (!node || typeof node !== "object") {
      return;
    }

    if (isEmptyConstruct(node, options) && isRemovableValue(node, parent, parentKey, grandparent)) {
      ranges.push(removalRange(node, parent, grandparent, options));
    }

    // Recursively walk child nodes
    for (const childKey of Object.keys(node)) {
      if (
        childKey === "loc" ||
        childKey === "start" ||
        childKey === "end" ||
        childKey === "range"
      ) {
        continue;
      }
      const value = (node as unknown as Record<string, unknown>)[childKey];
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item as BabelNode, node, childKey, parent));
      } else if (value && typeof value === "object") {
        walk(value as BabelNode, node, childKey, parent);
      }
    }
  }

  // Walk the AST
  if (ast.program) {
    walk(ast.program, null, "", null);
  }

  return mergeRanges(ranges);
}

/**
 * Remove ranges from input string
 */
function removeRanges(input: string, ranges: RangeToRemove[]): string {
  let result = input;
  for (const range of ranges) {
    const before = result.slice(0, range.start);
    const after = result.slice(range.end);
    result = before + after;
  }
  return result;
}

/**
 * Clean empty code constructs from JavaScript using Babel AST parsing
 * Pure function - no side effects
 */
export function cleanJs(input: string, options: JsCleanOptions = {}): Result<string, string> {
  if (!input.trim()) {
    return {
      ok: false,
      error: JS_ERROR_MESSAGES.EMPTY_INPUT,
    };
  }

  const opts = {
    removeEmptyObject: options?.removeEmptyObject ?? true,
    removeEmptyArray: options?.removeEmptyArray ?? true,
    removeEmptyFunction: options?.removeEmptyFunction ?? true,
    removeEmptyString: options?.removeEmptyString ?? true,
  };

  try {
    let result = input;

    // Remove empty objects, arrays, functions, and strings using AST parsing
    // This properly handles context (e.g., won't remove property values in objects)
    const emptyConstructRanges = findEmptyConstructs(result, opts);
    result = removeRanges(result, emptyConstructRanges);

    // Final cleanup: collapse blank lines left by removed statements
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Error al limpiar código: ${message}` };
  }
}

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
 * Check if an object/array/string is a "removable" empty construct.
 * We should only remove empty values that are:
 * - Standalone statements
 * - Variable initializers (entire declaration will be removed)
 * - Return values
 * - Not nested as property values inside other objects (would leave invalid syntax)
 */
function isRemovableValue(parent: BabelNode | null | undefined, key: string): boolean {
  if (!parent) return true; // No parent = top level, removable

  const parentType = parent.type as string;

  // If parent is VariableDeclarator, we're in the init - removable
  // BUT we need to remove the ENTIRE declaration, not just the value
  if (parentType === "VariableDeclarator") {
    return true;
  }

  // If parent is an expression statement, we're top-level - removable
  if (parentType === "ExpressionStatement") {
    return true;
  }

  // If parent is ReturnStatement, we're in return value - removable
  if (parentType === "ReturnStatement") {
    return true;
  }

  // If parent is AssignmentExpression and we're in the right side - removable
  if (parentType === "AssignmentExpression" && key === "right") {
    return true;
  }

  // If parent is ObjectExpression, this is a property VALUE - NOT removable
  // because removing it would leave invalid syntax like {a: }
  if (parentType === "ObjectExpression") {
    return false;
  }

  // If parent is ArrayExpression, this is an element - removable
  if (parentType === "ArrayExpression") {
    return true;
  }

  // If parent is Property or ObjectProperty (object property), we're the value - NOT removable
  if (parentType === "Property" || parentType === "ObjectProperty") {
    return false;
  }

  // For function arguments, call expressions, etc. - removable
  if (parentType === "CallExpression" || parentType === "OptionalCallExpression") {
    return true;
  }

  // Default: allow removal
  return true;
}

/**
 * Parse JavaScript code and find empty constructs using Babel AST
 */
function findEmptyConstructs(input: string, options: JsCleanOptions): RangeToRemove[] {
  const ranges: RangeToRemove[] = [];
  const { removeEmptyObject, removeEmptyArray, removeEmptyFunction, removeEmptyString } = options;

  let ast: babelParser.ParseResult | null = null;
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

    const nodeType = node.type;

    // Check for empty ObjectExpression: {}
    if (removeEmptyObject && nodeType === "ObjectExpression") {
      const obj = node;
      if (obj.properties.length === 0 && isRemovableValue(parent, parentKey)) {
        // Check if grandparent is VariableDeclaration - if so, remove entire declaration
        const rangeNode = grandparent?.type === "VariableDeclaration" ? grandparent : obj;
        ranges.push({
          start: rangeNode.start ?? 0,
          end: rangeNode.end ?? input.length,
        });
      }
    }

    // Check for empty ArrayExpression: []
    if (removeEmptyArray && nodeType === "ArrayExpression") {
      const arr = node;
      if (arr.elements.length === 0 && isRemovableValue(parent, parentKey)) {
        // Check if grandparent is VariableDeclaration - if so, remove entire declaration
        const rangeNode = grandparent?.type === "VariableDeclaration" ? grandparent : arr;
        ranges.push({
          start: rangeNode.start ?? 0,
          end: rangeNode.end ?? input.length,
        });
      }
    }

    // Check for empty function body: function() {} or () => {}
    // Also handles: function name() {} and async functions
    if (
      removeEmptyFunction &&
      (nodeType === "FunctionExpression" ||
        nodeType === "ArrowFunctionExpression" ||
        nodeType === "FunctionDeclaration")
    ) {
      const fn = node;
      const body = fn.body;

      // Arrow functions with expression body (no braces) don't have empty body
      if (body?.type === "BlockStatement") {
        const block = body;
        // Empty block statement
        const isEmpty = block.body.length === 0;
        // Only remove if safe (not a property value in an object)
        if (isEmpty && isRemovableValue(parent, parentKey)) {
          // Check if grandparent is VariableDeclaration - if so, remove entire declaration
          const rangeNode = grandparent?.type === "VariableDeclaration" ? grandparent : fn;
          ranges.push({
            start: rangeNode.start ?? 0,
            end: rangeNode.end ?? input.length,
          });
        }
      }
    }

    // Check for empty string: "" or ''
    // Only remove if it's safe to do so (not a property value in an object)
    if (removeEmptyString && nodeType === "StringLiteral") {
      const str = node;
      if (str.value === "" && isRemovableValue(parent, parentKey)) {
        // Check if grandparent is VariableDeclaration - if so, remove entire declaration
        const rangeNode = grandparent?.type === "VariableDeclaration" ? grandparent : str;
        ranges.push({
          start: rangeNode.start ?? 0,
          end: rangeNode.end ?? input.length,
        });
      }
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

  // Sort ranges by start position (descending) to remove from end to start
  // This prevents index shifting issues when removing
  ranges.sort((a, b) => b.start - a.start);

  // Filter overlapping ranges - keep only the outermost ones
  const filteredRanges: RangeToRemove[] = [];
  for (const range of ranges) {
    const overlaps = filteredRanges.some(
      (existing) => range.start >= existing.start && range.end <= existing.end,
    );
    if (!overlaps) {
      filteredRanges.push(range);
    }
  }

  return filteredRanges;
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

    // Final cleanup: remove multiple semicolons and clean up whitespace
    result = result.replace(/;{2,}/g, ";");
    result = result.replace(/,\s*,/g, ",");
    result = result.replace(/\n{3,}/g, "\n\n");
    result = result.trim();

    return { ok: true, value: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Error al limpiar código: ${message}` };
  }
}

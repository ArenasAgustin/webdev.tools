import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { serviceMessage } from "@/services/serviceMessage";
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
    return { ok: false, error: message || serviceMessage("services.js.formatError") };
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
      return { ok: false, error: serviceMessage("services.js.minifyUnavailable") };
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
  EMPTY_INPUT: serviceMessage("services.js.empty"),
  PARSE_ERROR: serviceMessage("services.js.parseError"),
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
 * AST keys that hold metadata rather than child nodes.
 */
const NON_CHILD_KEYS = new Set([
  "loc",
  "start",
  "end",
  "range",
  "extra",
  "leadingComments",
  "trailingComments",
  "innerComments",
]);

/**
 * Statement lists: removing a whole statement from one leaves valid code with
 * the same control flow. A statement that is the direct body of an if, else,
 * loop or label is never removed: that would change which statement the
 * construct controls.
 */
function isStatementList(node: BabelNode | null): boolean {
  return node?.type === "Program" || node?.type === "BlockStatement";
}

/**
 * Count how many times each name appears as an identifier in the program,
 * bindings and references alike. Property names after a dot and plain object
 * keys are not references and are skipped. A binding whose name appears more
 * than once may be read somewhere, so it is kept.
 */
function countIdentifiers(root: BabelNode): Map<string, number> {
  const counts = new Map<string, number>();

  function visit(value: unknown, parent: BabelNode | null, key: string): void {
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, parent, key));
      return;
    }
    if (!value || typeof value !== "object") return;

    const node = value as BabelNode;
    if (node.type === "Identifier" || node.type === "JSXIdentifier") {
      const isPropertyName =
        (key === "property" &&
          (parent?.type === "MemberExpression" || parent?.type === "OptionalMemberExpression") &&
          !parent.computed) ||
        (key === "key" && parent?.type === "ObjectProperty" && !parent.computed);
      if (!isPropertyName) {
        counts.set(node.name, (counts.get(node.name) ?? 0) + 1);
      }
    }

    for (const childKey of Object.keys(node)) {
      if (NON_CHILD_KEYS.has(childKey)) continue;
      visit((node as unknown as Record<string, unknown>)[childKey], node, childKey);
    }
  }

  visit(root, null, "");
  return counts;
}

/**
 * Check whether a binding is a plain identifier that appears nowhere else in
 * the program, so removing its declaration or assignment cannot affect a read.
 */
function isUnusedBinding(
  id: BabelNode | null | undefined,
  identifierCounts: Map<string, number>,
): boolean {
  return id?.type === "Identifier" && identifierCounts.get(id.name) === 1;
}

/**
 * Check if an empty construct can be removed from where it sits without
 * changing what the rest of the program does. Only these are removed:
 * - Initializers of a declaration in a statement list whose binding is used
 *   nowhere else (the declarator or the whole declaration is removed)
 * - Standalone expression statements in a statement list
 * - Assignment statements in a statement list to an identifier used nowhere
 *   else
 * - Array elements (removed together with their comma)
 * - Function declarations in a statement list that are never referenced
 * Exported declarations, return values, object property values, call
 * arguments, operands and the direct bodies of if/else/loops/labels are kept:
 * removing them would leave invalid syntax or change the meaning of the code.
 */
function isRemovableValue(
  node: BabelNode,
  key: string,
  ancestors: BabelNode[],
  identifierCounts: Map<string, number>,
): boolean {
  const parent = ancestors[ancestors.length - 1] ?? null;
  const grandparent = ancestors[ancestors.length - 2] ?? null;
  const greatGrandparent = ancestors[ancestors.length - 3] ?? null;
  if (!parent) return false;

  switch (parent.type) {
    case "VariableDeclarator":
      return (
        key === "init" &&
        grandparent?.type === "VariableDeclaration" &&
        isStatementList(greatGrandparent) &&
        isUnusedBinding(parent.id, identifierCounts)
      );
    case "ExpressionStatement":
      return isStatementList(grandparent);
    case "ArrayExpression":
      return true;
    case "AssignmentExpression":
      return (
        key === "right" &&
        parent.operator === "=" &&
        grandparent?.type === "ExpressionStatement" &&
        isStatementList(greatGrandparent) &&
        isUnusedBinding(parent.left, identifierCounts)
      );
    case "Program":
    case "BlockStatement":
      return node.type === "FunctionDeclaration" && isUnusedBinding(node.id, identifierCounts);
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
  identifierCounts: Map<string, number>,
): RangeToRemove {
  if (parent?.type === "VariableDeclarator" && grandparent?.type === "VariableDeclaration") {
    const allRemovable = grandparent.declarations.every(
      (declarator) =>
        isEmptyConstruct(declarator.init, options) &&
        isUnusedBinding(declarator.id, identifierCounts),
    );
    return allRemovable
      ? { start: grandparent.start ?? 0, end: grandparent.end ?? 0 }
      : listItemRange(grandparent.declarations, parent);
  }

  if (parent?.type === "ArrayExpression") {
    return listItemRange(parent.elements, node);
  }

  // Assignment and expression statements go as a whole, parentheses included
  if (parent?.type === "AssignmentExpression" && grandparent) {
    return { start: grandparent.start ?? 0, end: grandparent.end ?? 0 };
  }
  if (parent?.type === "ExpressionStatement") {
    return { start: parent.start ?? 0, end: parent.end ?? 0 };
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

  const identifierCounts = countIdentifiers(ast.program);

  /**
   * Walk the AST and find empty constructs. `ancestors` holds the path from
   * the program down to the parent of `node`.
   */
  function walk(node: BabelNode | null | undefined, key: string, ancestors: BabelNode[]): void {
    if (!node || typeof node !== "object") {
      return;
    }

    if (
      isEmptyConstruct(node, options) &&
      isRemovableValue(node, key, ancestors, identifierCounts)
    ) {
      const parent = ancestors[ancestors.length - 1] ?? null;
      const grandparent = ancestors[ancestors.length - 2] ?? null;
      ranges.push(removalRange(node, parent, grandparent, options, identifierCounts));
    }

    // Recursively walk child nodes
    const childAncestors = [...ancestors, node];
    for (const childKey of Object.keys(node)) {
      if (NON_CHILD_KEYS.has(childKey)) {
        continue;
      }
      const value = (node as unknown as Record<string, unknown>)[childKey];
      if (Array.isArray(value)) {
        value.forEach((item) => walk(item as BabelNode, childKey, childAncestors));
      } else if (value && typeof value === "object") {
        walk(value as BabelNode, childKey, childAncestors);
      }
    }
  }

  // Walk the AST
  if (ast.program) {
    walk(ast.program, "", []);
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
    return { ok: false, error: serviceMessage("services.js.cleanError", { message }) };
  }
}

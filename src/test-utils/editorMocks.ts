/**
 * Shared test utilities for editor component tests.
 *
 * Note: JSX mock implementations cannot be imported inside vi.mock() factories
 * due to Vitest hoisting. This module exports non-JSX helpers:
 * - Base props factories
 * - Expand state factories
 */
import { vi } from "vitest";

export interface ExpandedEditorMocks {
  mockExpand: ReturnType<typeof vi.fn>;
  mockCollapse: ReturnType<typeof vi.fn>;
  expandedState: { value: "input" | "output" | null };
}

/** Creates shared expand/collapse mock fns and a mutable state container. */
export function createExpandedEditorMocks(): ExpandedEditorMocks {
  return {
    mockExpand: vi.fn(),
    mockCollapse: vi.fn(),
    expandedState: { value: null },
  };
}

export interface BaseEditorProps {
  output: string;
  error: string | null;
  validationState: {
    isValid: boolean;
    error: { message: string } | null;
  };
  inputWarning: string | null;
  onInputChange: ReturnType<typeof vi.fn>;
  onClearInput: ReturnType<typeof vi.fn>;
  onLoadExample: ReturnType<typeof vi.fn>;
  onCopyOutput: ReturnType<typeof vi.fn>;
  onDownloadInput: ReturnType<typeof vi.fn>;
  onDownloadOutput: ReturnType<typeof vi.fn>;
}

/** Returns a fresh set of base props for GenericEditors tests. */
export function createBaseEditorProps(): BaseEditorProps {
  return {
    output: "output text",
    error: null,
    validationState: { isValid: true, error: null },
    inputWarning: "warning",
    onInputChange: vi.fn(),
    onClearInput: vi.fn(),
    onLoadExample: vi.fn(),
    onCopyOutput: vi.fn(),
    onDownloadInput: vi.fn(),
    onDownloadOutput: vi.fn(),
  };
}

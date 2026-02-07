/**
 * JavaScript Playground specific types
 */

export interface JsEditorState {
  input: string;
  output: string;
  error: string | null;
}

export interface JsExecutionResult {
  logs: string[];
  error: string | null;
  returnValue: string | null;
}

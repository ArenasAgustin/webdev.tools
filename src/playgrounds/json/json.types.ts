/**
 * JSON Playground specific types
 */

export interface JsonEditorState {
  input: string;
  output: string;
  error: string | null;
}

export interface JsonValidationState {
  isValid: boolean;
  error: {
    message: string;
  } | null;
}

export interface JsonPathState {
  expression: string;
  output: string;
  error: string | null;
}

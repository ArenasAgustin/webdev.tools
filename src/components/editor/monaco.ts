import { loader } from "@monaco-editor/react";

// Minimal structural view of the Monaco API the editor wrappers use. @monaco-editor/react
// types its loader against `monaco-editor`, which is not a direct dependency of this
// project, so those types do not resolve here.

export interface MonacoModel {
  getValue(): string;
  setValue(value: string): void;
  getFullModelRange(): unknown;
  dispose(): void;
}

export interface MonacoCodeEditor {
  getModel(): MonacoModel | null;
  getValue(): string;
  setValue(value: string): void;
  executeEdits(
    source: string,
    edits: { range: unknown; text: string; forceMoveMarkers?: boolean }[],
  ): unknown;
  pushUndoStop(): unknown;
  updateOptions(options: Record<string, unknown>): void;
  onDidChangeModelContent(listener: () => void): { dispose(): void };
  dispose(): void;
}

export interface MonacoDiffModel {
  original: MonacoModel;
  modified: MonacoModel;
}

export interface MonacoDiffEditor {
  getModel(): MonacoDiffModel | null;
  setModel(model: MonacoDiffModel | null): void;
  getOriginalEditor(): MonacoCodeEditor;
  getModifiedEditor(): MonacoCodeEditor;
  dispose(): void;
}

export interface MonacoApi {
  editor: {
    create(container: HTMLElement, options: Record<string, unknown>): MonacoCodeEditor;
    createDiffEditor(container: HTMLElement, options: Record<string, unknown>): MonacoDiffEditor;
    createModel(value: string, language?: string): MonacoModel;
    setModelLanguage(model: MonacoModel, language: string): void;
  };
}

export interface MonacoLoad extends Promise<MonacoApi> {
  cancel(): void;
}

/** Loads Monaco (once, shared); `cancel()` makes a pending load reject with `{ type: "cancelation" }`. */
export function loadMonaco(): MonacoLoad {
  return loader.init();
}

export function isCancelation(error: unknown): boolean {
  return (error as { type?: string } | null)?.type === "cancelation";
}

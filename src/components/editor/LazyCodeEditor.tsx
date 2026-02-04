import { lazy, Suspense } from "react";
import { CodeEditorLoader } from "./CodeEditorLoader";

// Lazy load Monaco Editor
const CodeEditorComponent = lazy(() =>
  import("./CodeEditor").then((module) => ({ default: module.CodeEditor })),
);

interface CodeEditorProps {
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
}

/**
 * Lazy-loaded wrapper for CodeEditor
 * Delays Monaco Editor loading until needed
 */
export function LazyCodeEditor(props: CodeEditorProps) {
  return (
    <Suspense fallback={<CodeEditorLoader />}>
      <CodeEditorComponent {...props} />
    </Suspense>
  );
}

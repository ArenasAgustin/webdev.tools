import { lazy, Suspense } from "react";
import { CodeEditorLoader } from "./CodeEditorLoader";

const DiffCodeEditorComponent = lazy(() =>
  import("./DiffCodeEditor").then((m) => ({ default: m.DiffCodeEditor })),
);

interface LazyDiffEditorProps {
  original: string;
  modified: string;
  language: string;
}

export function LazyDiffEditor(props: LazyDiffEditorProps) {
  return (
    <Suspense fallback={<CodeEditorLoader />}>
      <DiffCodeEditorComponent {...props} />
    </Suspense>
  );
}

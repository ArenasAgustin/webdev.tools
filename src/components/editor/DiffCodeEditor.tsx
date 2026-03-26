import { memo } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { CodeEditorLoader } from "./CodeEditorLoader";

interface DiffCodeEditorProps {
  original: string;
  modified: string;
  language: string;
}

export const DiffCodeEditor = memo(function DiffCodeEditor({
  original,
  modified,
  language,
}: DiffCodeEditorProps) {
  return (
    <div className="w-full h-full min-w-0 rounded-lg overflow-hidden border border-white/10">
      <DiffEditor
        className="h-full"
        language={language}
        original={original}
        modified={modified}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "none",
          padding: { top: 12, bottom: 12 },
          renderSideBySide: false,
        }}
        loading={<CodeEditorLoader />}
      />
    </div>
  );
});

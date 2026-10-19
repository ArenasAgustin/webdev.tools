import { memo } from "react";
import { useTranslation } from "react-i18next";
import { DiffEditor, type DiffOnMount } from "@monaco-editor/react";
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
  const { t } = useTranslation();
  const ariaLabels = {
    originalAriaLabel: t("editor.diffOriginalLabel"),
    modifiedAriaLabel: t("editor.diffModifiedLabel"),
  };

  // Monaco recomputes each pane's ariaLabel from the changed options only, so its
  // internal post-create option update wipes the construction labels; re-apply them.
  const handleMount: DiffOnMount = (editor) => {
    editor.getOriginalEditor().updateOptions({ ariaLabel: ariaLabels.originalAriaLabel });
    editor.getModifiedEditor().updateOptions({ ariaLabel: ariaLabels.modifiedAriaLabel });
  };

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
          ...ariaLabels,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "none",
          padding: { top: 12, bottom: 12 },
          renderSideBySide: false,
        }}
        onMount={handleMount}
        loading={<CodeEditorLoader />}
      />
    </div>
  );
});

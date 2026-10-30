import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditorLoadError } from "./EditorLoadError";
import { isCancelation, loadMonaco, type MonacoApi, type MonacoDiffEditor } from "./monaco";
import { CodeEditorLoader } from "./CodeEditorLoader";

interface DiffCodeEditorProps {
  original: string;
  modified: string;
  language: string;
}

const DIFF_EDITOR_OPTIONS = {
  theme: "vs-dark",
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 12,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  renderLineHighlight: "none",
  padding: { top: 12, bottom: 12 },
  renderSideBySide: false,
} as const;

export const DiffCodeEditor = memo(function DiffCodeEditor({
  original,
  modified,
  language,
}: DiffCodeEditorProps) {
  const { t } = useTranslation();
  const originalAriaLabel = t("editor.diffOriginalLabel");
  const modifiedAriaLabel = t("editor.diffModifiedLabel");

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoDiffEditor | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const latestRef = useRef({ original, modified, language, originalAriaLabel, modifiedAriaLabel });
  useLayoutEffect(() => {
    latestRef.current = { original, modified, language, originalAriaLabel, modifiedAriaLabel };
  });

  // One effect owns the diff editor lifecycle (not @monaco-editor/react, which disposes
  // the models while the widget still holds them: "TextModel got disposed before
  // DiffEditorWidget model got reset"). Teardown detaches the models, disposes the
  // widget, and only then disposes the models; reconnects never reuse a disposed editor.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    let editor: MonacoDiffEditor | null = null;
    const init = loadMonaco();
    init
      .then((monaco) => {
        if (!active) return;
        const initial = latestRef.current;
        editor = monaco.editor.createDiffEditor(container, {
          ...DIFF_EDITOR_OPTIONS,
          originalAriaLabel: initial.originalAriaLabel,
          modifiedAriaLabel: initial.modifiedAriaLabel,
        });
        editor.setModel({
          original: monaco.editor.createModel(initial.original, initial.language),
          modified: monaco.editor.createModel(initial.modified, initial.language),
        });
        monacoRef.current = monaco;
        editorRef.current = editor;
        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!isCancelation(error)) {
          console.error("Monaco initialization: error:", error);
          if (active) setLoadFailed(true);
        }
      });
    return () => {
      active = false;
      init.cancel();
      editorRef.current = null;
      monacoRef.current = null;
      setIsReady(false);
      if (editor) {
        const models = editor.getModel();
        editor.setModel(null);
        editor.dispose();
        models?.original.dispose();
        models?.modified.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const models = editorRef.current?.getModel();
    if (!models) return;
    if (models.original.getValue() !== original) models.original.setValue(original);
    if (models.modified.getValue() !== modified) models.modified.setValue(modified);
  }, [original, modified, isReady]);

  useEffect(() => {
    const models = editorRef.current?.getModel();
    const monaco = monacoRef.current;
    if (!models || !monaco) return;
    monaco.editor.setModelLanguage(models.original, language);
    monaco.editor.setModelLanguage(models.modified, language);
  }, [language, isReady]);

  // Monaco recomputes each pane's ariaLabel from the changed options only, so its
  // internal post-create option update wipes the construction labels; re-apply them.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.getOriginalEditor().updateOptions({ ariaLabel: originalAriaLabel });
    editor.getModifiedEditor().updateOptions({ ariaLabel: modifiedAriaLabel });
  }, [originalAriaLabel, modifiedAriaLabel, isReady]);

  return (
    <div className="relative w-full h-full min-w-0 rounded-lg overflow-hidden border border-white/10">
      {loadFailed && <EditorLoadError />}
      {!isReady && !loadFailed && (
        <div className="absolute inset-0">
          <CodeEditorLoader />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" data-testid="diff-editor-container" />
    </div>
  );
});

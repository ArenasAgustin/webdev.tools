import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isCancelation, loadMonaco, type MonacoApi, type MonacoCodeEditor } from "./monaco";

interface CodeEditorProps {
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const EDITOR_OPTIONS = {
  theme: "vs-dark",
  minimap: { enabled: false },
  fontSize: 12,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: "on",
  renderLineHighlight: "none",
  padding: { top: 12, bottom: 12 },
} as const;

export const CodeEditor = memo(function CodeEditor({
  value,
  language,
  readOnly = false,
  onChange,
  placeholder,
}: CodeEditorProps) {
  const { t } = useTranslation();
  // Accessible name + WCAG 2.1.2 hint: Monaco traps Tab for indentation; its native
  // toggleTabFocusMode binding (Ctrl+M, Ctrl+Shift+M on macOS) lets keyboard users leave.
  const ariaLabel = `${t("editor.codeEditorLabel")}. ${t("editor.tabFocusHint")}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoCodeEditor | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const applyingValueRef = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Latest props for the async creation path and the change listener.
  const latestRef = useRef({ value, language, readOnly, ariaLabel, onChange });
  useLayoutEffect(() => {
    latestRef.current = { value, language, readOnly, ariaLabel, onChange };
  });

  // One effect owns the whole editor lifecycle (not @monaco-editor/react): it creates the
  // editor on connect and disposes editor-then-model on disconnect. StrictMode/Suspense
  // effect reconnects and unmounts while Monaco is still loading therefore never touch
  // a disposed editor ("InstantiationService has been disposed").
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    let editor: MonacoCodeEditor | null = null;
    const init = loadMonaco();
    init
      .then((monaco) => {
        if (!active) return;
        const initial = latestRef.current;
        const model = monaco.editor.createModel(initial.value, initial.language);
        editor = monaco.editor.create(container, {
          ...EDITOR_OPTIONS,
          model,
          readOnly: initial.readOnly,
          ariaLabel: initial.ariaLabel,
        });
        const created = editor;
        created.onDidChangeModelContent(() => {
          if (!applyingValueRef.current) latestRef.current.onChange?.(created.getValue());
        });
        monacoRef.current = monaco;
        editorRef.current = created;
        setIsReady(true);
      })
      .catch((error: unknown) => {
        if (!isCancelation(error)) {
          console.error("Monaco initialization: error:", error);
        }
      });
    return () => {
      active = false;
      init.cancel();
      editorRef.current = null;
      monacoRef.current = null;
      setIsReady(false);
      if (editor) {
        const model = editor.getModel();
        editor.dispose();
        model?.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.getValue() === value) return;
    applyingValueRef.current = true;
    try {
      if (readOnly) {
        editor.setValue(value);
      } else {
        // An edit (not setValue) keeps the change on the user's undo stack.
        const model = editor.getModel();
        if (model) {
          editor.executeEdits("", [
            { range: model.getFullModelRange(), text: value, forceMoveMarkers: true },
          ]);
          editor.pushUndoStop();
        }
      }
    } finally {
      applyingValueRef.current = false;
    }
  }, [value, readOnly, isReady]);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (model && monacoRef.current) monacoRef.current.editor.setModelLanguage(model, language);
  }, [language, isReady]);

  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly, ariaLabel });
  }, [readOnly, ariaLabel, isReady]);

  return (
    <div className="relative w-full h-full min-w-0 rounded-lg overflow-hidden border border-white/10">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">
          {placeholder ?? t("editor.loading")}
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" data-testid="code-editor-container" />
    </div>
  );
});

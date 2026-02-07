import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function CodeEditor({
  value,
  language,
  readOnly = false,
  onChange,
  placeholder,
}: CodeEditorProps) {
  const handleChange = (newValue: string | undefined) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full h-full min-h-[240px] sm:min-h-[280px] lg:min-h-[320px] min-w-0 rounded-lg overflow-hidden border border-white/10">
      <Editor
        className="h-full"
        defaultLanguage={language}
        language={language}
        value={value}
        onChange={handleChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          renderLineHighlight: "none",
          padding: { top: 12, bottom: 12 },
        }}
        loading={
          <div className="w-full h-full flex items-center justify-center bg-black/40 text-white text-xs">
            {placeholder || "Cargando editor..."}
          </div>
        }
      />
    </div>
  );
}

import { CodeEditor } from "@/components/editor/CodeEditor";

interface ExpandedEditorModalProps {
  title: string;
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onClose: () => void;
}

export function ExpandedEditorModal({
  title,
  value,
  language,
  readOnly = false,
  onChange,
  onClose,
}: ExpandedEditorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full h-full max-w-6xl max-h-screen bg-gray-800 rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            value={value}
            language={language}
            readOnly={readOnly}
            onChange={onChange}
            placeholder={`Contenido de ${title}...`}
          />
        </div>
      </div>
    </div>
  );
}

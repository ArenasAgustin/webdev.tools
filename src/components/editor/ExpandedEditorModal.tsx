import { CodeEditor } from "@/components/editor/CodeEditor";
import { type ReactNode } from "react";

interface ExpandedEditorModalProps {
  title: string;
  icon: string;
  iconColor?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

const iconColors = {
  "blue-400": "text-blue-400",
  "green-400": "text-green-400",
  "red-400": "text-red-400",
  "yellow-400": "text-yellow-400",
  "purple-400": "text-purple-400",
  "cyan-400": "text-cyan-400",
};

export function ExpandedEditorModal({
  title,
  icon,
  iconColor = "blue-400",
  actions,
  footer,
  value,
  language,
  readOnly = false,
  onChange,
}: ExpandedEditorModalProps) {
  const iconColorClass =
    iconColors[iconColor as keyof typeof iconColors] || iconColors["blue-400"];

  return (
    <section className="bg-black/50 rounded-xl p-4 shadow-2xl transition-all duration-300 border border-white/5 fixed inset-0 m-4 flex flex-col z-[9999] backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className={`fas fa-${icon} ${iconColorClass}`}></i>
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Editor */}
      <div className="w-full flex-1 min-h-0">
        <CodeEditor
          value={value}
          language={language}
          readOnly={readOnly}
          onChange={onChange}
          placeholder={`Contenido de ${title}...`}
        />
      </div>
      {footer && <div className="mt-2 text-xs h-4">{footer}</div>}
    </section>
  );
}

import { memo } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { InputActions } from "@/components/editor/InputActions";
import { OutputActions } from "@/components/editor/OutputActions";
import { InputFooter } from "@/components/common/InputFooter";
import { OutputFooter } from "@/components/common/OutputFooter";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";

interface CssEditorsProps {
  inputCss: string;
  output: string;
  error: string | null;
  validationState: {
    isValid: boolean;
    error: {
      message: string;
    } | null;
  };
  inputWarning?: string | null;
  onInputChange: (code: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
}

export const CssEditors = memo(function CssEditors({
  inputCss,
  output,
  error,
  validationState,
  inputWarning,
  onInputChange,
  onClearInput,
  onLoadExample,
  onCopyOutput,
  onDownloadInput,
  onDownloadOutput,
}: CssEditorsProps) {
  const editor = useExpandedEditor();
  const inputStats = useTextStats(inputCss);
  const outputStats = useTextStats(output);

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title="CSS"
          icon="code"
          iconColor="blue-400"
          actions={
            <InputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <InputFooter
              inputValue={inputCss}
              validationState={validationState}
              inputWarning={inputWarning}
              waitingLabel="Esperando CSS..."
              validLabel="CSS válido"
              invalidLabel="CSS inválido"
              stats={inputStats}
            />
          }
          value={inputCss}
          language="css"
          onChange={onInputChange}
        />
      )}

      {editor.isExpanded("output") && (
        <ExpandedEditorModal
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <OutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={editor.collapse}
            />
          }
          footer={
            <OutputFooter
              output={output}
              error={error}
              outputStats={outputStats}
              comparisonBytes={inputStats.bytes}
            />
          }
          value={output}
          language="css"
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        <Panel
          title="CSS"
          icon="code"
          iconColor="blue-400"
          actions={
            <InputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={() => editor.expand("input")}
            />
          }
          footer={
            <InputFooter
              inputValue={inputCss}
              validationState={validationState}
              inputWarning={inputWarning}
              waitingLabel="Esperando CSS..."
              validLabel="CSS válido"
              invalidLabel="CSS inválido"
              stats={inputStats}
            />
          }
        >
          <LazyCodeEditor
            value={inputCss}
            language="css"
            onChange={onInputChange}
            placeholder="Escribe tu CSS aquí..."
          />
        </Panel>

        <Panel
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={
            <OutputActions
              onCopyOutput={onCopyOutput}
              onDownloadOutput={onDownloadOutput}
              onExpand={() => editor.expand("output")}
            />
          }
          footer={
            <OutputFooter
              output={output}
              error={error}
              outputStats={outputStats}
              comparisonBytes={inputStats.bytes}
            />
          }
        >
          <LazyCodeEditor
            value={output}
            language="css"
            readOnly={true}
            placeholder="El resultado se mostrará aquí..."
          />
        </Panel>
      </main>
    </>
  );
});

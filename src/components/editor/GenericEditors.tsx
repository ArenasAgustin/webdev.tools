import { type ReactNode, memo } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { InputActions } from "@/components/editor/InputActions";
import { OutputActions } from "@/components/editor/OutputActions";
import { EditorFooter } from "@/components/common/EditorFooter";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor } from "@/hooks/useExpandedEditor";

interface GenericEditorsProps {
  input: string;
  output: string;
  error: string | null;
  validationState: {
    isValid: boolean;
    error: { message: string } | null;
  };
  inputWarning?: string | null;
  language: string;
  inputTitle: string;
  inputPlaceholder: string;
  outputPlaceholder?: string;
  waitingLabel: string;
  validLabel: string;
  invalidLabel: string;
  onInputChange: (value: string) => void;
  onClearInput: () => void;
  onLoadExample: () => void;
  onCopyOutput: () => void;
  onDownloadInput: () => void;
  onDownloadOutput: () => void;
  extraOutputActions?: ReactNode;
  outputPanel?: (props: {
    output: string;
    error: string | null;
    outputStats: { lines: number; characters: number; bytes: number };
    comparisonBytes: number;
    expandOutput: () => void;
    onCopyOutput: () => void;
    onDownloadOutput: () => void;
  }) => ReactNode;
}

export const GenericEditors = memo(function GenericEditors({
  input,
  output,
  error,
  validationState,
  inputWarning,
  language,
  inputTitle,
  inputPlaceholder,
  outputPlaceholder = "El resultado se mostrará aquí...",
  waitingLabel,
  validLabel,
  invalidLabel,
  onInputChange,
  onClearInput,
  onLoadExample,
  onCopyOutput,
  onDownloadInput,
  onDownloadOutput,
  extraOutputActions,
  outputPanel,
}: GenericEditorsProps) {
  const editor = useExpandedEditor();
  const inputStats = useTextStats(input);
  const outputStats = useTextStats(output);

  const inputFooter = (
    <EditorFooter
      variant="input"
      value={input}
      validationState={validationState}
      warning={inputWarning}
      waitingLabel={waitingLabel}
      validLabel={validLabel}
      invalidLabel={invalidLabel}
      stats={inputStats}
    />
  );

  const outputFooter = (
    <EditorFooter
      variant="output"
      value={output}
      error={error}
      stats={outputStats}
      comparisonBytes={inputStats.bytes}
    />
  );

  const outputActions = (onExpand: () => void) => (
    <>
      <OutputActions
        onCopyOutput={onCopyOutput}
        onDownloadOutput={onDownloadOutput}
        onExpand={onExpand}
      />
      {extraOutputActions}
    </>
  );

  const defaultOutputPanel = (
    <Panel
      title="Resultado"
      icon="terminal"
      iconColor="green-400"
      actions={outputActions(() => editor.expand("output"))}
      footer={outputFooter}
    >
      <LazyCodeEditor
        value={output}
        language={language}
        readOnly={true}
        placeholder={outputPlaceholder}
      />
    </Panel>
  );

  return (
    <>
      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title={inputTitle}
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
          footer={inputFooter}
          value={input}
          language={language}
          onChange={onInputChange}
        />
      )}

      {editor.isExpanded("output") && (
        <ExpandedEditorModal
          title="Resultado"
          icon="terminal"
          iconColor="green-400"
          actions={outputActions(editor.collapse)}
          footer={outputFooter}
          value={output}
          language={language}
          readOnly={true}
        />
      )}

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        <Panel
          title={inputTitle}
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
          footer={inputFooter}
        >
          <LazyCodeEditor
            value={input}
            language={language}
            onChange={onInputChange}
            placeholder={inputPlaceholder}
          />
        </Panel>

        {outputPanel
          ? outputPanel({
              output,
              error,
              outputStats,
              comparisonBytes: inputStats.bytes,
              expandOutput: () => editor.expand("output"),
              onCopyOutput,
              onDownloadOutput,
            })
          : defaultOutputPanel}
      </main>
    </>
  );
});

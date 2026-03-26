import { type ReactNode, memo, useState } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { ExpandedEditorModal } from "@/components/editor/ExpandedEditorModal";
import { ExpandedDiffModal } from "@/components/editor/ExpandedDiffModal";
import { InputActions } from "@/components/editor/InputActions";
import { OutputActions } from "@/components/editor/OutputActions";
import { Button } from "@/components/common/Button";
import { EditorFooter } from "@/components/common/EditorFooter";
import { EditorTabBar } from "@/components/editor/EditorTabBar";
import { useTextStats } from "@/hooks/useTextStats";
import { useExpandedEditor, type UseExpandedEditorReturn } from "@/hooks/useExpandedEditor";
import { cn } from "@/utils/cn";

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
  isProcessing?: boolean;
  onUseOutputAsInput?: () => void;
  onUseInputAsOutput?: () => void;
  extraOutputActions?: ReactNode;
  /** When provided, renders the diff modal (open state controlled externally) */
  diffModal?: { isOpen: boolean; close: () => void };
  /** When provided, uses this expanded-editor state instead of internal state */
  editorState?: UseExpandedEditorReturn;
  /** Handler for file import via button or drag & drop */
  onImportFile?: (file: File) => void;
  /** Accepted file extensions for the hidden file input (e.g. ".json" or ".js,.ts") */
  acceptExtensions?: string;
  outputPanel?: (props: {
    output: string;
    error: string | null;
    outputStats: { lines: number; characters: number; bytes: number };
    comparisonBytes: number;
    expandOutput: () => void;
    onCopyOutput: () => void;
    onDownloadOutput: () => void;
    onUseOutputAsInput?: () => void;
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
  isProcessing,
  onUseOutputAsInput,
  onUseInputAsOutput,
  extraOutputActions,
  diffModal,
  editorState,
  outputPanel,
  onImportFile,
  acceptExtensions,
}: GenericEditorsProps) {
  const ownEditor = useExpandedEditor();
  const editor = editorState ?? ownEditor;
  const inputStats = useTextStats(input);
  const outputStats = useTextStats(output);
  const [isDragOver, setIsDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"input" | "output">("input");
  const [prevOutput, setPrevOutput] = useState(output);

  // Auto-switch to output tab on first result (empty → non-empty transition only).
  // Uses the React "store previous prop" pattern — safe setState during render.
  if (prevOutput !== output) {
    setPrevOutput(output);
    if (prevOutput === "" && output !== "") {
      setActiveTab("output");
    }
  }

  const dragHandlers = onImportFile
    ? {
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        },
        onDragLeave: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) onImportFile(file);
        },
      }
    : {};

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
      isProcessing={isProcessing}
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
        onUseOutputAsInput={onUseOutputAsInput}
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
      {diffModal?.isOpen && (
        <ExpandedDiffModal
          original={input}
          modified={output}
          language={language}
          onClose={diffModal.close}
          actions={
            <Button variant="primary" onClick={diffModal.close} aria-label="Cerrar">
              <i className="fas fa-times" aria-hidden="true"></i>
            </Button>
          }
        />
      )}

      {editor.isExpanded("input") && (
        <ExpandedEditorModal
          title={inputTitle}
          icon="code"
          iconColor="blue-400"
          onClose={editor.collapse}
          actions={
            <InputActions
              onClearInput={onClearInput}
              onLoadExample={onLoadExample}
              onDownloadInput={onDownloadInput}
              onExpand={editor.collapse}
              onUseInputAsOutput={onUseInputAsOutput}
              onImportFile={onImportFile}
              acceptExtensions={acceptExtensions}
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
          onClose={editor.collapse}
          actions={outputActions(editor.collapse)}
          footer={outputFooter}
          value={output}
          language={language}
          readOnly={true}
        />
      )}

      <EditorTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        inputLabel="Entrada"
        outputLabel="Salida"
      />

      <main className="grid flex-1 min-h-0 grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2 min-w-0">
        <div id="panel-input" className={cn(activeTab !== "input" && "hidden", "sm:block")}>
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
                onUseInputAsOutput={onUseInputAsOutput}
                onImportFile={onImportFile}
                acceptExtensions={acceptExtensions}
              />
            }
            footer={inputFooter}
          >
            <div className="relative h-full" {...dragHandlers}>
              <LazyCodeEditor
                value={input}
                language={language}
                onChange={onInputChange}
                placeholder={inputPlaceholder}
              />
              {isDragOver && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-500/10 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none transition-all">
                  <span className="text-blue-300 font-medium text-sm">
                    Soltar archivo aquí
                  </span>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div id="panel-output" className={cn(activeTab !== "output" && "hidden", "sm:block")}>
          {outputPanel
            ? outputPanel({
                output,
                error,
                outputStats,
                comparisonBytes: inputStats.bytes,
                expandOutput: () => editor.expand("output"),
                onCopyOutput,
                onDownloadOutput,
                onUseOutputAsInput,
              })
            : defaultOutputPanel}
        </div>
      </main>
    </>
  );
});

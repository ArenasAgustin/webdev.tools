import { useMemo, useState } from "react";
import { Toolbar } from "@/components/layout/Toolbar";
import { PlaygroundLayout } from "@/components/layout/PlaygroundLayout";
import { GenericEditors } from "@/components/editor/GenericEditors";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { OutputActions } from "@/components/editor/OutputActions";
import { Button } from "@/components/common/Button";
import { EditorFooter } from "@/components/common/EditorFooter";
import { htmlPlaygroundConfig } from "./html.config";
import { useHtmlParser } from "@/hooks/useHtmlParser";
import { useHtmlPlaygroundActions } from "@/hooks/useHtmlPlaygroundActions";
import { usePlaygroundSetup, usePlaygroundToolbar } from "@/hooks/usePlaygroundSetup";
import { useModalState } from "@/hooks/useModalState";
import { loadLastHtml, saveLastHtml, loadHtmlToolsConfig } from "@/services/storage";
import type { HtmlFormatConfig, HtmlMinifyConfig } from "@/types/html";
import { DEFAULT_HTML_FORMAT_CONFIG, DEFAULT_HTML_MINIFY_CONFIG } from "@/types/html";

const preload = () => {
  void import("@/services/formatter/prettier");
  void import("@/services/html/transform");
  void import("@/services/html/workerClient");
};

function inspectDom(source: string): string | null {
  if (!source.trim()) {
    return null;
  }

  const parsed = new DOMParser().parseFromString(source, "text/html");
  const tags = Array.from(parsed.querySelectorAll("*"));

  if (tags.length === 0) {
    return null;
  }

  const counters = new Map<string, number>();
  for (const node of tags) {
    const tagName = node.tagName.toLowerCase();
    counters.set(tagName, (counters.get(tagName) ?? 0) + 1);
  }

  return Array.from(counters.entries())
    .slice(0, 8)
    .map(([tag, count]) => `${tag} (${count})`)
    .join(" · ");
}

export function HtmlPlayground() {
  const shortcutsModal = useModalState();
  const [showPreview, setShowPreview] = useState(false);

  const ctx = usePlaygroundSetup<HtmlFormatConfig, HtmlMinifyConfig>({
    playgroundConfig: htmlPlaygroundConfig,
    loadToolsConfig: loadHtmlToolsConfig,
    loadLastInput: loadLastHtml,
    saveLastInput: saveLastHtml,
    defaultFormatConfig: DEFAULT_HTML_FORMAT_CONFIG,
    defaultMinifyConfig: DEFAULT_HTML_MINIFY_CONFIG,
    preload,
  });

  const previewSource = useMemo(
    () => (ctx.output.trim() ? ctx.output : ctx.input),
    [ctx.output, ctx.input],
  );
  const domInspection = useMemo(() => inspectDom(previewSource), [previewSource]);

  const validation = useHtmlParser(ctx.debouncedInput);

  const actions = useHtmlPlaygroundActions({
    inputHtml: ctx.input,
    setInputHtml: ctx.setInput,
    output: ctx.output,
    setOutput: ctx.setOutput,
    setError: ctx.setError,
    inputTooLarge: ctx.inputTooLarge,
    inputTooLargeMessage: ctx.inputTooLargeMessage,
    formatConfig: ctx.formatConfig,
    minifyConfig: ctx.minifyConfig,
    toast: ctx.toast,
  });

  const { toolbarTools, toolbarConfig } = usePlaygroundToolbar({
    handleFormat: actions.handleFormat,
    handleMinify: actions.handleMinify,
    handleCopyOutput: actions.handleCopyOutput,
    handleClearInput: actions.handleClearInput,
    configModal: ctx.configModal,
    mode: "html" as const,
    formatConfig: ctx.formatConfig,
    setFormatConfig: ctx.setFormatConfig,
    minifyConfig: ctx.minifyConfig,
    setMinifyConfig: ctx.setMinifyConfig,
    isProcessing: actions.isProcessing,
    onOpenShortcuts: shortcutsModal.open,
  });

  return (
    <PlaygroundLayout
      editors={
        <GenericEditors
          input={ctx.input}
          output={ctx.output}
          error={ctx.error}
          validationState={validation}
          inputWarning={ctx.inputWarning}
          language="html"
          inputTitle="HTML"
          inputPlaceholder="Escribe tu HTML aquí..."
          waitingLabel="Esperando HTML..."
          validLabel="HTML válido"
          invalidLabel="HTML inválido"
          onInputChange={ctx.setInput}
          onClearInput={actions.handleClearInput}
          onLoadExample={actions.handleLoadExample}
          onCopyOutput={actions.handleCopyOutput}
          onDownloadInput={actions.handleDownloadInput}
          onDownloadOutput={actions.handleDownloadOutput}
          isProcessing={actions.isProcessing}
          extraOutputActions={
            <Button
              variant="cyan"
              onClick={() => setShowPreview(true)}
              aria-label="Ver vista previa"
              title="Ver vista previa"
            >
              <i className="fas fa-eye"></i>
            </Button>
          }
          outputPanel={
            showPreview
              ? () => (
                  <Panel
                    title="Vista previa"
                    icon="eye"
                    iconColor="cyan-400"
                    actions={
                      <Button
                        variant="primary"
                        onClick={() => setShowPreview(false)}
                        aria-label="Ver resultado"
                        title="Ver resultado"
                      >
                        <i className="fas fa-terminal"></i>
                      </Button>
                    }
                  >
                    <div className="flex h-full min-h-[220px] flex-col gap-2">
                      <iframe
                        title="Vista previa HTML"
                        srcDoc={previewSource}
                        sandbox="allow-scripts"
                        className="h-full min-h-[150px] w-full rounded-lg border border-white/10 bg-white"
                      />
                      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                        <div className="mb-1 font-medium text-cyan-300">Inspección DOM</div>
                        {domInspection ? (
                          <span data-testid="dom-inspection-summary">{domInspection}</span>
                        ) : (
                          <span className="text-gray-400">Sin elementos para inspeccionar</span>
                        )}
                      </div>
                    </div>
                  </Panel>
                )
              : ({
                  output: outputValue,
                  error: outputError,
                  outputStats,
                  comparisonBytes,
                  expandOutput,
                  onCopyOutput,
                  onDownloadOutput,
                }) => (
                  <Panel
                    title="Resultado"
                    icon="terminal"
                    iconColor="green-400"
                    actions={
                      <>
                        <OutputActions
                          onCopyOutput={onCopyOutput}
                          onDownloadOutput={onDownloadOutput}
                          onExpand={expandOutput}
                        />
                        <Button
                          variant="cyan"
                          onClick={() => setShowPreview(true)}
                          aria-label="Ver vista previa"
                          title="Ver vista previa"
                        >
                          <i className="fas fa-eye"></i>
                        </Button>
                      </>
                    }
                    footer={
                      <EditorFooter
                        variant="output"
                        value={outputValue}
                        error={outputError}
                        isProcessing={actions.isProcessing}
                        stats={outputStats}
                        comparisonBytes={comparisonBytes}
                      />
                    }
                  >
                    <LazyCodeEditor
                      value={outputValue}
                      language="html"
                      readOnly={true}
                      placeholder="El resultado se mostrará aquí..."
                    />
                  </Panel>
                )
          }
        />
      }
      toolbar={<Toolbar variant="generic" tools={toolbarTools} config={toolbarConfig} shortcuts={shortcutsModal} />}
    />
  );
}

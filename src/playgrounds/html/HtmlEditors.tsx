import { memo, useMemo, useState } from "react";
import { Panel } from "@/components/layout/Panel";
import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { OutputActions } from "@/components/editor/OutputActions";
import { Button } from "@/components/common/Button";
import { OutputFooter } from "@/components/common/OutputFooter";
import { GenericEditors } from "@/components/editor/GenericEditors";

interface HtmlEditorsProps {
  inputHtml: string;
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

export const HtmlEditors = memo(function HtmlEditors({
  inputHtml,
  output,
  ...rest
}: HtmlEditorsProps) {
  const [showPreview, setShowPreview] = useState(false);
  const previewSource = useMemo(() => (output.trim() ? output : inputHtml), [output, inputHtml]);
  const domInspection = useMemo(() => inspectDom(previewSource), [previewSource]);

  return (
    <GenericEditors
      input={inputHtml}
      output={output}
      language="html"
      inputTitle="HTML"
      inputPlaceholder="Escribe tu HTML aquí..."
      waitingLabel="Esperando HTML..."
      validLabel="HTML válido"
      invalidLabel="HTML inválido"
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
                  <OutputFooter
                    output={outputValue}
                    error={outputError}
                    outputStats={outputStats}
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
      {...rest}
    />
  );
});

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

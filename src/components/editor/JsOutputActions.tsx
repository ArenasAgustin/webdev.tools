import { Button } from "@/components/common/Button";

interface JsOutputActionsProps {
  onCopyOutput: () => void;
  onDownloadOutput: () => void;
  onExpand: () => void;
}

export function JsOutputActions({
  onCopyOutput,
  onDownloadOutput,
  onExpand,
}: JsOutputActionsProps) {
  return (
    <>
      <Button variant="primary" onClick={onCopyOutput}>
        <i className="fas fa-copy"></i> Copiar
      </Button>
      <Button variant="cyan" onClick={onDownloadOutput}>
        <i className="fas fa-download"></i> Descargar
      </Button>
      <Button
        variant="purple"
        onClick={onExpand}
        aria-label="Expandir editor"
        title="Expandir editor"
      >
        <i className="fas fa-expand" aria-hidden="true"></i>
      </Button>
    </>
  );
}

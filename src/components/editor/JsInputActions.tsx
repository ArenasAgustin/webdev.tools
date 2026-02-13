import { Button } from "@/components/common/Button";

interface JsInputActionsProps {
  onCopyInput: () => void;
  onDownloadInput: () => void;
  onExpand: () => void;
}

export function JsInputActions({ onCopyInput, onDownloadInput, onExpand }: JsInputActionsProps) {
  return (
    <>
      <Button variant="primary" onClick={onCopyInput}>
        <i className="fas fa-copy"></i> Copiar
      </Button>
      <Button variant="cyan" onClick={onDownloadInput}>
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

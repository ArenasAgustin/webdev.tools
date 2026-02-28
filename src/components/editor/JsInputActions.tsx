import { Button } from "@/components/common/Button";

interface JsInputActionsProps {
  onClearInput: () => void;
  onLoadExample: () => void;
  onDownloadInput: () => void;
  onExpand: () => void;
}

export function JsInputActions({
  onClearInput,
  onLoadExample,
  onDownloadInput,
  onExpand,
}: JsInputActionsProps) {
  return (
    <>
      <Button variant="danger" onClick={onClearInput}>
        <i className="fas fa-trash"></i> Limpiar
      </Button>
      <Button variant="success" onClick={onLoadExample}>
        <i className="fas fa-file-import"></i> Ejemplo
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

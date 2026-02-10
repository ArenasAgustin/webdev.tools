import { Button } from "@/components/common/Button";

interface JsonInputActionsProps {
  onClearInput: () => void;
  onLoadExample: () => void;
  onDownloadInput: () => void;
  onExpand: () => void;
}

export function JsonInputActions({
  onClearInput,
  onLoadExample,
  onDownloadInput,
  onExpand,
}: JsonInputActionsProps) {
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
      <Button variant="purple" onClick={onExpand}>
        <i className="fas fa-expand"></i>
      </Button>
    </>
  );
}

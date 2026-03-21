import { Button } from "@/components/common/Button";

interface InputActionsProps {
  onClearInput: () => void;
  onLoadExample: () => void;
  onDownloadInput: () => void;
  onExpand: () => void;
  onUseInputAsOutput?: () => void;
}

export function InputActions({
  onClearInput,
  onLoadExample,
  onDownloadInput,
  onExpand,
  onUseInputAsOutput,
}: InputActionsProps) {
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
      {onUseInputAsOutput && (
        <Button
          variant="orange"
          onClick={onUseInputAsOutput}
          aria-label="Usar entrada como resultado"
          title="Usar entrada como resultado"
        >
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </Button>
      )}
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

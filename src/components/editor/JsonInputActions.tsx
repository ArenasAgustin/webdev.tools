import { Button } from "@/components/common/Button";

interface JsonInputActionsProps {
  onClearInput: () => void;
  onLoadExample: () => void;
  onExpand: () => void;
}

export function JsonInputActions({
  onClearInput,
  onLoadExample,
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
      <Button variant="purple" onClick={onExpand}>
        <i className="fas fa-expand"></i>
      </Button>
    </>
  );
}

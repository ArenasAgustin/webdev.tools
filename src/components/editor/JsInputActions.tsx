import { Button } from "@/components/common/Button";

interface JsInputActionsProps {
  onCopyInput: () => void;
  onExpand: () => void;
}

export function JsInputActions({ onCopyInput, onExpand }: JsInputActionsProps) {
  return (
    <>
      <Button variant="primary" onClick={onCopyInput}>
        <i className="fas fa-copy"></i> Copiar
      </Button>
      <Button variant="purple" onClick={onExpand}>
        <i className="fas fa-expand"></i>
      </Button>
    </>
  );
}

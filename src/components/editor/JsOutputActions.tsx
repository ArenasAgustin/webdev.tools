import { Button } from "@/components/common/Button";

interface JsOutputActionsProps {
  onCopyOutput: () => void;
  onExpand: () => void;
}

export function JsOutputActions({
  onCopyOutput,
  onExpand,
}: JsOutputActionsProps) {
  return (
    <>
      <Button variant="primary" onClick={onCopyOutput}>
        <i className="fas fa-copy"></i> Copiar
      </Button>
      <Button variant="purple" onClick={onExpand}>
        <i className="fas fa-expand"></i>
      </Button>
    </>
  );
}

import { Button } from "@/components/common/Button";

interface JsonOutputActionsProps {
  onCopyOutput: () => void;
  onDownloadOutput: () => void;
  onExpand: () => void;
}

export function JsonOutputActions({
  onCopyOutput,
  onDownloadOutput,
  onExpand,
}: JsonOutputActionsProps) {
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

import { Button } from "@/components/common/Button";

interface OutputActionsProps {
  onCopyOutput: () => void;
  onDownloadOutput: () => void;
  onExpand: () => void;
  onUseOutputAsInput?: () => void;
}

export function OutputActions({ onCopyOutput, onDownloadOutput, onExpand, onUseOutputAsInput }: OutputActionsProps) {
  return (
    <>
      <Button variant="primary" onClick={onCopyOutput}>
        <i className="fas fa-copy"></i> Copiar
      </Button>
      <Button variant="cyan" onClick={onDownloadOutput}>
        <i className="fas fa-download"></i> Descargar
      </Button>
      {onUseOutputAsInput && (
        <Button
          variant="orange"
          onClick={onUseOutputAsInput}
          aria-label="Usar resultado como entrada"
          title="Usar resultado como entrada"
        >
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
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

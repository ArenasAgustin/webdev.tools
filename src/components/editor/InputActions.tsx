import { useRef } from "react";
import { Button } from "@/components/common/Button";

interface InputActionsProps {
  onClearInput: () => void;
  onLoadExample: () => void;
  onDownloadInput: () => void;
  onExpand: () => void;
  onUseInputAsOutput?: () => void;
  onImportFile?: (file: File) => void;
  acceptExtensions?: string;
}

export function InputActions({
  onClearInput,
  onLoadExample,
  onDownloadInput,
  onExpand,
  onUseInputAsOutput,
  onImportFile,
  acceptExtensions,
}: InputActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button variant="danger" onClick={onClearInput} aria-label="Limpiar entrada">
        <i className="fas fa-trash"></i> <span className="hidden sm:inline">Limpiar</span>
      </Button>
      <Button variant="success" onClick={onLoadExample} aria-label="Cargar ejemplo">
        <i className="fas fa-file-import"></i> <span className="hidden sm:inline">Ejemplo</span>
      </Button>
      {onImportFile && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptExtensions}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImportFile(file);
              e.target.value = "";
            }}
          />
          <Button variant="primary" onClick={() => fileInputRef.current?.click()} aria-label="Importar archivo">
            <i className="fas fa-folder-open"></i> <span className="hidden sm:inline">Abrir</span>
          </Button>
        </>
      )}
      <Button variant="cyan" onClick={onDownloadInput} aria-label="Descargar entrada">
        <i className="fas fa-download"></i> <span className="hidden sm:inline">Descargar</span>
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

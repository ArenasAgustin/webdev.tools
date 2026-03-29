import { useRef } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="danger"
        onClick={onClearInput}
        aria-label={t("actions.clearInput")}
        title={t("common.clear")}
      >
        <i className="fas fa-trash"></i>
      </Button>
      <Button
        variant="success"
        onClick={onLoadExample}
        aria-label={t("actions.loadExample")}
        title={t("common.example")}
      >
        <i className="fas fa-file-import"></i>
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
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("actions.importFile")}
            title={t("common.open")}
          >
            <i className="fas fa-folder-open"></i>
          </Button>
        </>
      )}
      <Button
        variant="cyan"
        onClick={onDownloadInput}
        aria-label={t("actions.downloadInput")}
        title={t("common.download")}
      >
        <i className="fas fa-download"></i>
      </Button>
      {onUseInputAsOutput && (
        <Button
          variant="orange"
          onClick={onUseInputAsOutput}
          aria-label={t("actions.useInputAsOutput")}
          title={t("actions.useInputAsOutput")}
        >
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </Button>
      )}
      <Button
        variant="purple"
        onClick={onExpand}
        aria-label={t("actions.expandEditor")}
        title={t("actions.expandEditor")}
      >
        <i className="fas fa-expand" aria-hidden="true"></i>
      </Button>
    </>
  );
}

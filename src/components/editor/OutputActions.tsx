import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";

interface OutputActionsProps {
  onCopyOutput: () => void;
  onDownloadOutput: () => void;
  onExpand: () => void;
  onUseOutputAsInput?: () => void;
}

export function OutputActions({
  onCopyOutput,
  onDownloadOutput,
  onExpand,
  onUseOutputAsInput,
}: OutputActionsProps) {
  const { t } = useTranslation();
  return (
    <>
      <Button
        variant="primary"
        onClick={onCopyOutput}
        aria-label={t("actions.copyResult")}
        title={t("common.copy")}
      >
        <i className="fas fa-copy"></i>
      </Button>
      <Button
        variant="cyan"
        onClick={onDownloadOutput}
        aria-label={t("actions.downloadResult")}
        title={t("common.download")}
      >
        <i className="fas fa-download"></i>
      </Button>
      {onUseOutputAsInput && (
        <Button
          variant="orange"
          onClick={onUseOutputAsInput}
          aria-label={t("actions.useOutputAsInput")}
          title={t("actions.useOutputAsInput")}
        >
          <i className="fas fa-arrow-left" aria-hidden="true"></i>
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

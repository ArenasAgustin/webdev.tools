import { type ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@/components/common/Container";
import { LazyDiffEditor } from "@/components/editor/LazyDiffEditor";

interface ExpandedDiffModalProps {
  actions?: ReactNode;
  original: string;
  modified: string;
  language: string;
  onClose?: () => void;
}

export function ExpandedDiffModal({
  actions,
  original,
  modified,
  language,
  onClose,
}: ExpandedDiffModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!onClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <Container
      title={t("editor.diffTitle")}
      icon="code-compare"
      iconColor="purple-400"
      actions={actions}
      variant="modal"
    >
      <LazyDiffEditor original={original} modified={modified} language={language} />
    </Container>
  );
}

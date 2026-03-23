import { type ReactNode } from "react";
import { Container } from "@/components/common/Container";
import { LazyDiffEditor } from "@/components/editor/LazyDiffEditor";

interface ExpandedDiffModalProps {
  actions?: ReactNode;
  original: string;
  modified: string;
  language: string;
}

export function ExpandedDiffModal({
  actions,
  original,
  modified,
  language,
}: ExpandedDiffModalProps) {
  return (
    <Container
      title="Diferencias"
      icon="code-compare"
      iconColor="purple-400"
      actions={actions}
      variant="modal"
    >
      <LazyDiffEditor original={original} modified={modified} language={language} />
    </Container>
  );
}

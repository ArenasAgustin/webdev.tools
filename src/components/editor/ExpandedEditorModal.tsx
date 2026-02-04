import { LazyCodeEditor } from "@/components/editor/LazyCodeEditor";
import { type ReactNode } from "react";
import { Container } from "@/components/common/Container";
import type { IconColorKey } from "@/utils/constants/colors";

interface ExpandedEditorModalProps {
  title: string;
  icon: string;
  iconColor?: IconColorKey;
  actions?: ReactNode;
  footer?: ReactNode;
  value: string;
  language: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function ExpandedEditorModal({
  title,
  icon,
  iconColor = "blue-400",
  actions,
  footer,
  value,
  language,
  readOnly = false,
  onChange,
}: ExpandedEditorModalProps) {
  return (
    <Container
      title={title}
      icon={icon}
      iconColor={iconColor}
      actions={actions}
      footer={footer}
      variant="modal"
    >
      <LazyCodeEditor
        value={value}
        language={language}
        readOnly={readOnly}
        onChange={onChange}
        placeholder={`Contenido de ${title}...`}
      />
    </Container>
  );
}

import { type ReactNode } from "react";
import { Container } from "@/components/common/Container";
import type { IconColorKey } from "@/utils/constants/colors";

interface PanelProps {
  title: string;
  icon: string;
  iconColor?: IconColorKey;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function Panel({
  title,
  icon,
  iconColor = "blue-400",
  actions,
  children,
  footer,
}: PanelProps) {
  return (
    <Container
      title={title}
      icon={icon}
      iconColor={iconColor}
      actions={actions}
      footer={footer}
      variant="panel"
    >
      {children}
    </Container>
  );
}

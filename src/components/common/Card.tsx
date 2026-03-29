import { type ReactNode, memo } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  title?: string;
  icon?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
}

/**
 * Reusable card component for modal sections
 */
export const Card = memo(function Card({
  title,
  icon,
  children,
  className = "",
  headerClassName = "",
  titleClassName = "",
}: CardProps) {
  return (
    <div className={cn("border rounded-lg p-3", className)}>
      {title && (
        <h4 className={cn("font-semibold mb-2 flex items-center gap-2", headerClassName)}>
          {icon && <i className={`fas fa-${icon}`}></i>}
          <span className={titleClassName}>{title}</span>
        </h4>
      )}
      {children}
    </div>
  );
});

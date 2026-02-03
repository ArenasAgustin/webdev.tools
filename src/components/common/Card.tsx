import { type ReactNode } from "react";

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
export function Card({
  title,
  icon,
  children,
  className = "",
  headerClassName = "",
  titleClassName = "",
}: CardProps) {
  return (
    <div className={`border rounded-lg p-3 ${className}`}>
      {title && (
        <h4
          className={`font-semibold mb-2 flex items-center gap-2 ${headerClassName}`}
        >
          {icon && <i className={`fas fa-${icon}`}></i>}
          <span className={titleClassName}>{title}</span>
        </h4>
      )}
      {children}
    </div>
  );
}

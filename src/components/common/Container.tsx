import { type ReactNode } from "react";
import { getIconColorClass, type IconColorKey } from "@/utils/constants/colors";

interface ContainerProps {
  title: string;
  icon: string;
  iconColor?: IconColorKey;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "panel" | "modal";
  className?: string;
}

/**
 * Base container component for panels and modals
 * Provides consistent header, content area, and footer structure
 */
export function Container({
  title,
  icon,
  iconColor = "blue-400",
  actions,
  children,
  footer,
  variant = "panel",
  className = "",
}: ContainerProps) {
  const iconColorClass = getIconColorClass(iconColor);

  const baseClasses =
    "rounded-xl p-4 shadow-2xl transition-all duration-300 border border-white/5 flex flex-col";

  const variantClasses = {
    panel: "bg-white/10 backdrop-blur-md min-w-0",
    modal: "bg-black/50 backdrop-blur-md fixed inset-0 m-4 z-[9999]",
  };

  const containerClass = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <section className={containerClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className={`fas fa-${icon} ${iconColorClass}`}></i>
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 w-full">{children}</div>

      {/* Footer */}
      {footer && <div className="mt-2 text-xs h-4">{footer}</div>}
    </section>
  );
}

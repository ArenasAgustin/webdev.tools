import { type ReactNode } from "react";
import { getIconColorClass, type IconColorKey } from "@/utils/constants/colors";

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
  const iconColorClass = getIconColorClass(iconColor);

  return (
    <section className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-2xl transition-all duration-300 border border-white/5 flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <i className={`fas fa-${icon} ${iconColorClass}`}></i>
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
      {footer && <div className="mt-2 text-xs h-4">{footer}</div>}
    </section>
  );
}

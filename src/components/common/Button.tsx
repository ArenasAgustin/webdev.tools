import { type ReactNode, memo } from "react";

interface ButtonProps {
  variant?: "primary" | "danger" | "success" | "purple" | "cyan" | "orange";
  size?: "sm" | "md";
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  "aria-label"?: string;
  title?: string;
}

const variantStyles = {
  primary:
    "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/30",
  danger: "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30",
  success:
    "bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30",
  purple:
    "bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border-purple-500/30",
  cyan: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30",
  orange:
    "bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30",
};

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-2 py-2 text-xs",
};

export const Button = memo(function Button({
  variant = "primary",
  size = "sm",
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
  "aria-label": ariaLabel,
  title,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`${variantStyles[variant]} ${sizeStyles[size]} rounded transition-all border ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
});

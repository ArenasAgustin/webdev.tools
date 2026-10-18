import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type ToggleButtonGroupVariant = "default" | "segmented";

export interface ToggleOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

export interface ToggleButtonGroupProps<T extends string | number> {
  options: readonly ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: ToggleButtonGroupVariant;
  /** Accessible name for the `role="group"` container. */
  ariaLabel?: string;
  /** Overrides the variant's active classes. */
  activeClassName?: string;
  /** Overrides the variant's inactive classes. */
  inactiveClassName?: string;
}

interface VariantClasses {
  active: string;
  inactive: string;
  focus: string;
}

const VARIANT_CLASSES = {
  default: {
    active:
      "flex-1 p-2 bg-blue-500/30 border border-blue-500/50 rounded text-white transition-colors",
    inactive:
      "flex-1 p-2 bg-white/10 border border-white/20 rounded text-gray-400 hover:text-white transition-colors",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
  },
  segmented: {
    active: "px-4 py-2 rounded-lg font-medium transition-colors bg-cyan-500 text-white",
    inactive:
      "px-4 py-2 rounded-lg font-medium transition-colors bg-white/10 text-gray-300 hover:bg-white/20",
    focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
  },
} as const satisfies Record<ToggleButtonGroupVariant, VariantClasses>;

export function ToggleButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  variant = "default",
  ariaLabel,
  activeClassName,
  inactiveClassName,
}: ToggleButtonGroupProps<T>) {
  const classes = VARIANT_CLASSES[variant];

  return (
    <div className="flex gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              classes.focus,
              isActive
                ? (activeClassName ?? classes.active)
                : (inactiveClassName ?? classes.inactive),
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

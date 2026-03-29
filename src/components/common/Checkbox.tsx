import { type ChangeEvent, memo } from "react";
import { cn } from "@/utils/cn";

type CheckboxColor = "blue" | "purple" | "orange" | "green" | "cyan";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  color?: CheckboxColor;
  containerClassName?: string;
}

const colorClasses: Record<CheckboxColor, string> = {
  blue: "text-blue-500 focus:ring-blue-500",
  purple: "text-purple-500 focus:ring-purple-500",
  orange: "text-orange-500 focus:ring-orange-500",
  green: "text-green-500 focus:ring-green-500",
  cyan: "text-cyan-500 focus:ring-cyan-500",
};

export const Checkbox = memo(function Checkbox({
  checked,
  onChange,
  label,
  color = "blue",
  containerClassName = "",
}: CheckboxProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", containerClassName)}>
      <input
        type="checkbox"
        className={cn("w-4 h-4 rounded bg-gray-800 border-gray-600", colorClasses[color])}
        checked={checked}
        onChange={handleChange}
      />
      <span className="text-gray-400">{label}</span>
    </label>
  );
});

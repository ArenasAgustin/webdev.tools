interface RadioOption<T> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  name: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
  color?: "blue" | "purple" | "orange" | "green" | "cyan";
  className?: string;
}

const colorMap = {
  blue: "text-blue-500 focus:ring-blue-500",
  purple: "text-purple-500 focus:ring-purple-500",
  orange: "text-orange-500 focus:ring-orange-500",
  green: "text-green-500 focus:ring-green-500",
  cyan: "text-cyan-500 focus:ring-cyan-500",
} as const;

/**
 * Radio button group with color variants
 */
export function RadioGroup<T extends string>({
  name,
  value,
  options,
  onChange,
  color = "blue",
  className = "",
}: RadioGroupProps<T>) {
  const colorClasses = colorMap[color];

  return (
    <div className={`flex gap-4 ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            className={`w-4 h-4 bg-gray-800 border-gray-600 ${colorClasses}`}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="text-gray-400">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

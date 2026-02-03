interface ToggleOption<T> {
  value: T;
  label: string;
}

interface ToggleButtonGroupProps<T> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function ToggleButtonGroup<T>({
  options,
  value,
  onChange,
  activeClassName = "flex-1 p-2 bg-blue-500/30 border border-blue-500/50 rounded text-white transition-colors",
  inactiveClassName = "flex-1 p-2 bg-white/10 border border-white/20 rounded text-gray-400 hover:text-white transition-colors",
}: ToggleButtonGroupProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          className={
            value === option.value ? activeClassName : inactiveClassName
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

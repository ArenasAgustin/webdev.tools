import { useState, useCallback } from "react";
import {
  generatePasswordWithStrength,
  defaultPasswordOptions,
  calculateStrength,
  type PasswordOptions,
} from "./password.utils";

export function PasswordPlayground() {
  const [options, setOptions] = useState<PasswordOptions>(defaultPasswordOptions);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const result = generatePasswordWithStrength(options);
    setPassword(result.password);
    setCopied(false);

    // Add to history (keep last 5)
    setHistory((prev) => {
      const newHistory = [result.password, ...prev];
      return newHistory.slice(0, 5);
    });
  }, [options]);

  const handleCopy = useCallback(() => {
    if (password) {
      try {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.warn("Clipboard write failed:", err);
      }
    }
  }, [password]);

  const handleOptionChange = useCallback((key: keyof PasswordOptions, value: boolean | number) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleHistoryClick = useCallback((pwd: string) => {
    setPassword(pwd);
    setCopied(false);
  }, []);

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-yellow-500";
    if (strength < 80) return "bg-green-500";
    return "bg-emerald-400";
  };

  const strengthResult = password ? calculateStrength(password, options) : null;

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-6">
      {/* Password Output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            readOnly
            placeholder="Tu contraseña aparecerá aquí"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white font-mono text-lg focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
            title={showPassword ? "Ocultar" : "Mostrar"}
          >
            <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Generar
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!password}
            className={`p-3 rounded-lg transition-colors ${
              copied ? "bg-green-500 text-white" : "bg-white/10 hover:bg-white/20 text-gray-300"
            }`}
            title="Copiar"
          >
            <i className={`fas ${copied ? "fa-check" : "fa-copy"}`}></i>
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-4">
        <h3 className="text-white font-medium">Opciones</h3>

        {/* Length Slider */}
        <div className="flex items-center gap-4">
          <label className="text-gray-300 w-24">Longitud:</label>
          <input
            type="range"
            min="8"
            max="128"
            value={options.length}
            onChange={(e) => handleOptionChange("length", parseInt(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-white font-mono w-12 text-right">{options.length}</span>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => handleOptionChange("includeUppercase", e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            Mayúsculas (A-Z)
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => handleOptionChange("includeLowercase", e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            Minúsculas (a-z)
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => handleOptionChange("includeNumbers", e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            Números (0-9)
          </label>
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => handleOptionChange("includeSymbols", e.target.checked)}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            Símbolos (!@#$%)
          </label>
        </div>
      </div>

      {/* Strength Indicator */}
      {password && strengthResult && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Fortaleza:</span>
            <div className="flex-1 h-2 bg-white/10 rounded-lg overflow-hidden">
              <div
                className={`h-full ${getStrengthColor(strengthResult.strength)} transition-all`}
                style={{ width: `${strengthResult.strength}%` }}
              />
            </div>
            <span className="text-white font-medium">
              {strengthResult.label} ({strengthResult.strength}%)
            </span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-gray-300 text-sm">Historial:</h3>
          <div className="flex flex-wrap gap-2">
            {history.map((pwd, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleHistoryClick(pwd)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-mono rounded-lg transition-colors truncate max-w-32"
                title={pwd}
              >
                {pwd.slice(0, 8)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

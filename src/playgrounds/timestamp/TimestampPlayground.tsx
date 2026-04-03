import { useState, useCallback } from "react";
import { timestampConfig } from "./timestamp.config";
import { convertTimestamp, getCurrentTimestamp, type TimestampResult } from "./timestamp.utils";

export function TimestampPlayground() {
  const [input, setInput] = useState(timestampConfig.example);
  const [result, setResult] = useState<TimestampResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleConvert = useCallback(() => {
    setError(null);

    if (!input.trim()) {
      setResult(null);
      return;
    }

    const converted = convertTimestamp(input, timezone);
    if (converted) {
      setResult(converted);
    } else {
      setError("Input inválido. Ingresa un timestamp o fecha válida.");
      setResult(null);
    }
  }, [input, timezone]);

  const handleNow = useCallback(() => {
    const now = getCurrentTimestamp();
    setInput(String(now));
    setError(null);

    const converted = convertTimestamp(String(now), timezone);
    setResult(converted);
  }, [timezone]);

  const handleClear = useCallback(() => {
    setInput("");
    setResult(null);
    setError(null);
  }, []);

  const copyToClipboard = useCallback((value: string) => {
    try {
      navigator.clipboard.writeText(value);
    } catch {
      // Silently fail if clipboard is unavailable
    }
  }, []);

  const formatLabels: { key: keyof TimestampResult; label: string }[] = [
    { key: "unixSeconds", label: "Unix (s)" },
    { key: "unixMilliseconds", label: "Unix (ms)" },
    { key: "iso8601", label: "ISO 8601" },
    { key: "rfc2822", label: "RFC 2822" },
    { key: "humanReadable", label: "Local" },
    { key: "relative", label: "Relativo" },
  ];

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          placeholder="Unix timestamp o fecha (ISO 8601, RFC 2822)..."
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
          spellCheck={false}
        />

        {/* Timezone selector */}
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">Zona horaria:</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">New York (EST/EDT)</option>
            <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Europe/Paris">Paris (CET/CEST)</option>
            <option value="Europe/Madrid">Madrid (CET/CEST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConvert}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-exchange-alt mr-2"></i>
            Convertir
          </button>
          <button
            type="button"
            onClick={handleNow}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-clock mr-2"></i>
            Ahora
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-trash-alt mr-2"></i>
            Limpiar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-2">
          {/* Future indicator */}
          {result.isFuture && (
            <div className="p-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 text-sm">
              ⏱️ Esta fecha es en el futuro
            </div>
          )}

          {formatLabels.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-xs font-mono text-gray-400 uppercase w-24">{label}</span>
              <code className="text-sm text-white font-mono flex-1 text-right select-all">
                {result[key]}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(String(result[key]))}
                className="ml-3 text-gray-400 hover:text-white transition-colors"
                title="Copiar"
                aria-label={`Copiar ${label}`}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

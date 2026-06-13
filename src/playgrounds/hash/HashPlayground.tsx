import { useState, useCallback, useRef, useEffect } from "react";
import { hashConfig } from "./hash.config";
import {
  generateAllHashes,
  generateHashFromFile,
  type HashAlgorithm,
  type HashResult,
  type HashOutputCase,
} from "./hash.utils";

type InputMode = "text" | "file";

export function HashPlayground() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [textInput, setTextInput] = useState(hashConfig.example);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [outputCase, setOutputCase] = useState<HashOutputCase>("lowercase");
  const [results, setResults] = useState<HashResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compareValue, setCompareValue] = useState("");
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [clipboardError, setClipboardError] = useState(false);
  const clipboardErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (clipboardErrorTimerRef.current !== null) clearTimeout(clipboardErrorTimerRef.current);
    };
  }, []);

  const processInput = useCallback(async () => {
    setIsProcessing(true);
    setCompareResult(null);

    try {
      if (inputMode === "text") {
        if (!textInput) {
          setResults([]);
          setIsProcessing(false);
          return;
        }
        const hashes = await generateAllHashes(textInput, outputCase);
        setResults(hashes);
      } else if (fileInput) {
        const algorithms: HashAlgorithm[] = ["sha1", "sha256", "sha512"];
        const hashes = await Promise.all(
          algorithms.map(async (algorithm) => ({
            algorithm,
            hash: await generateHashFromFile(fileInput, algorithm, outputCase),
          })),
        );
        setResults(hashes);
      } else {
        setResults([]);
        setIsProcessing(false);
        return;
      }
    } catch (error) {
      console.error("Hash generation error:", error);
      setResults([]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputMode, textInput, fileInput, outputCase]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileInput(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
      setClipboardError(true);
      if (clipboardErrorTimerRef.current !== null) clearTimeout(clipboardErrorTimerRef.current);
      clipboardErrorTimerRef.current = setTimeout(() => setClipboardError(false), 2000);
    }
  }, []);

  const handleCompare = useCallback(() => {
    if (!compareValue || results.length === 0) return;

    // Find matching hash
    const match = results.find((r) => r.hash.toLowerCase() === compareValue.toLowerCase());
    setCompareResult(match !== undefined);
  }, [compareValue, results]);

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "text"
              ? "bg-cyan-500 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          Texto
        </button>
        <button
          type="button"
          onClick={() => setInputMode("file")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "file"
              ? "bg-cyan-500 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          Archivo
        </button>
      </div>

      {/* Input Section */}
      <div className="flex flex-col gap-4">
        {inputMode === "text" ? (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Ingresa el texto para generar hashes..."
            className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
            spellCheck={false}
          />
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              aria-hidden="true"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFileInput(file);
              }}
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              {...(!fileInput && {
                onClick: () => fileInputRef.current?.click(),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                },
                role: "button" as const,
                tabIndex: 0,
                "aria-label": "Seleccionar archivo — clic o arrastrar aquí",
              })}
              className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {fileInput ? (
                <div className="text-center">
                  <p className="text-white font-medium">{fileInput.name}</p>
                  <p className="text-gray-400 text-sm">{(fileInput.size / 1024).toFixed(2)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileInput(null);
                    }}
                    className="text-cyan-400 text-sm mt-2 hover:underline"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-400">Arrastrá un archivo o hacé clic aquí</p>
                </>
              )}
            </div>
          </>
        )}

        {/* Options */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              checked={outputCase === "uppercase"}
              onChange={(e) => setOutputCase(e.target.checked ? "uppercase" : "lowercase")}
              className="w-4 h-4 rounded bg-white/10 border-white/20"
            />
            Mayúsculas
          </label>

          <button
            type="button"
            onClick={processInput}
            disabled={isProcessing}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-cog mr-2"></i>
            )}
            Generar
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-medium">Resultados</h3>
          {results.map((result) => (
            <div
              key={result.algorithm}
              className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-xs font-mono text-gray-400 uppercase w-16">
                {result.algorithm}
              </span>
              <code className="text-sm text-white font-mono flex-1 text-right select-all">
                {result.hash}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(result.hash)}
                className="ml-3 text-gray-400 hover:text-white transition-colors"
                title="Copiar"
                aria-label={`Copiar hash ${result.algorithm}`}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clipboard error feedback */}
      {clipboardError && <p className="text-red-400 text-sm">No se pudo copiar al portapapeles</p>}

      {/* Compare Section */}
      <div className="flex flex-col gap-2 mt-4 p-4 bg-white/5 rounded-lg">
        <h3 className="text-white font-medium">Comparar Hash</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={compareValue}
            onChange={(e) => setCompareValue(e.target.value)}
            placeholder="Ingresa un hash para comparar..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={handleCompare}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Comparar
          </button>
        </div>
        {compareResult !== null && (
          <p className={`text-sm font-medium ${compareResult ? "text-green-400" : "text-red-400"}`}>
            {compareResult ? "✅ El hash coincide" : "❌ El hash NO coincide"}
          </p>
        )}
      </div>
    </div>
  );
}

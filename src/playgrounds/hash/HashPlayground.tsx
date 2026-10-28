import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { hashConfig } from "./hash.config";
import {
  generateAllHashes,
  generateAllHashesFromFile,
  type HashResult,
  type HashOutputCase,
  type InputMode,
} from "./hash.utils";
import { ToggleButtonGroup } from "@/components/common/ToggleButtonGroup";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { STORAGE_KEYS, removeItem } from "@/services/storage";

interface GeneratedHashes {
  mode: InputMode;
  text: string;
  file: File | null;
  results: HashResult[];
}

interface Comparison {
  value: string;
  source: GeneratedHashes;
  match: boolean;
}

const NO_RESULTS: HashResult[] = [];

function applyCase(hash: string, outputCase: HashOutputCase): string {
  return outputCase === "uppercase" ? hash.toUpperCase() : hash.toLowerCase();
}

export function HashPlayground() {
  const { t } = useTranslation();
  const [inputMode, setInputMode] = usePersistedState<InputMode>(
    STORAGE_KEYS.HASH_INPUT_MODE,
    "text",
  );
  // The text is often a secret (password, token), so it is never persisted:
  // only non-sensitive options survive a reload.
  const [textInput, setTextInput] = useState(hashConfig.example);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [outputCase, setOutputCase] = usePersistedState<HashOutputCase>(
    STORAGE_KEYS.HASH_OUTPUT_CASE,
    "lowercase",
  );
  const [generated, setGenerated] = useState<GeneratedHashes | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hashError, setHashError] = useState(false);
  const [compareValue, setCompareValue] = useState("");
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const { copy: copyToClipboard, error: clipboardError } = useClipboardCopy();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Purge the plain-text copy that earlier versions stored on disk
  useEffect(() => {
    removeItem(STORAGE_KEYS.HASH_TEXT_INPUT);
  }, []);

  // Results only belong to the input they were generated from: once the text,
  // file or mode changes they are hidden, which also drops slow results that land
  // after the input moved on. The case toggle is applied at display time.
  const isCurrent =
    generated !== null &&
    generated.mode === inputMode &&
    (inputMode === "text" ? generated.text === textInput : generated.file === fileInput);
  const results = useMemo(
    () =>
      isCurrent
        ? generated.results.map((result) => ({
            ...result,
            hash: applyCase(result.hash, outputCase),
          }))
        : NO_RESULTS,
    [isCurrent, generated, outputCase],
  );
  const compareResult =
    comparison !== null &&
    isCurrent &&
    comparison.source === generated &&
    comparison.value === compareValue
      ? comparison.match
      : null;

  const processInput = useCallback(async () => {
    setIsProcessing(true);
    setHashError(false);
    const source = { mode: inputMode, text: textInput, file: fileInput };

    try {
      if (inputMode === "text") {
        if (!textInput) {
          setGenerated(null);
          return;
        }
        const hashes = await generateAllHashes(textInput, outputCase);
        setGenerated({ ...source, results: hashes });
      } else if (fileInput) {
        const hashes = await generateAllHashesFromFile(fileInput, outputCase);
        setGenerated({ ...source, results: hashes });
      } else {
        setGenerated(null);
      }
    } catch (error) {
      console.error("Hash generation error:", error);
      setGenerated(null);
      setHashError(true);
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

  const handleCompare = useCallback(() => {
    // Pasted hashes often carry stray whitespace or the other letter case
    const expected = compareValue.trim().toLowerCase();
    if (!expected || !generated || results.length === 0) return;

    const match = results.find((r) => r.hash.toLowerCase() === expected);
    setComparison({ value: compareValue, source: generated, match: match !== undefined });
  }, [compareValue, generated, results]);

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Mode Tabs */}
      <ToggleButtonGroup
        variant="segmented"
        ariaLabel={t("hash.inputTypeGroupLabel")}
        options={[
          { value: "text", label: t("hash.inputTypeText") },
          { value: "file", label: t("hash.inputTypeFile") },
        ]}
        value={inputMode}
        onChange={setInputMode}
      />

      {/* Input Section */}
      <div className="flex flex-col gap-4">
        {inputMode === "text" ? (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t("hash.inputPlaceholder")}
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
                // Reset so picking the same file again still fires a change event
                e.target.value = "";
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
                "aria-label": t("hash.fileDropLabel"),
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
                    {t("hash.changeFile")}
                  </button>
                </div>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                  <p className="text-gray-400">{t("hash.dropFileHere")}</p>
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
            {t("hash.uppercase")}
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
            {t("hash.generate")}
          </button>
        </div>
      </div>

      {hashError && (
        <p role="alert" className="text-red-400 text-sm">
          {t("hash.generateError")}
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-medium">{t("hash.results")}</h3>
          {results.map((result) => (
            <div
              key={result.algorithm}
              className="flex items-center justify-between gap-3 bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-xs font-mono text-gray-400 uppercase w-16 shrink-0">
                {result.algorithm}
              </span>
              <code className="text-sm text-white font-mono flex-1 min-w-0 break-all text-right select-all">
                {result.hash}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(result.hash)}
                className="shrink-0 text-gray-400 hover:text-white transition-colors"
                title={t("hash.copyHash", { algorithm: result.algorithm })}
                aria-label={t("hash.copyHash", { algorithm: result.algorithm })}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Clipboard error feedback */}
      {clipboardError && <p className="text-red-400 text-sm">{t("hash.copyError")}</p>}

      {/* Compare Section */}
      <div className="flex flex-col gap-2 mt-4 p-4 bg-white/5 rounded-lg">
        <h3 className="text-white font-medium">{t("hash.compareTitle")}</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={compareValue}
            onChange={(e) => setCompareValue(e.target.value)}
            placeholder={t("hash.comparePlaceholder")}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="button"
            onClick={handleCompare}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            {t("hash.compareAction")}
          </button>
        </div>
        {compareResult !== null && (
          <p className={`text-sm font-medium ${compareResult ? "text-green-400" : "text-red-400"}`}>
            {compareResult ? `✅ ${t("hash.matchSuccess")}` : `❌ ${t("hash.matchFail")}`}
          </p>
        )}
      </div>
    </div>
  );
}

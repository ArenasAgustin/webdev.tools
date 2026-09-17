import { useState, useCallback, useRef, useEffect, useMemo, useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { base64Config } from "./base64.config";
import {
  encode,
  encodeText,
  decodeText,
  resolveMode,
  defaultBase64Options,
  Base64Error,
  type Base64Mode,
  type Base64Options,
  type Base64ErrorCode,
  type Base64InputMode,
} from "./base64.utils";
import { usePersistedState } from "@/hooks/usePersistedState";
import { STORAGE_KEYS } from "@/services/storage";

type FileState = { file: File; bytes: Uint8Array } | null;

type Base64Result = { ok: true; value: string } | { ok: false; code: Base64ErrorCode };

const ERROR_KEYS: Record<Base64ErrorCode, string> = {
  invalidCharacter: "base64.errorInvalidCharacter",
  invalidLength: "base64.errorInvalidLength",
  invalidPadding: "base64.errorInvalidPadding",
  invalidUtf8: "base64.errorInvalidUtf8",
};

export function Base64Playground() {
  const { t } = useTranslation();
  const [inputMode, setInputMode] = usePersistedState<Base64InputMode>(
    STORAGE_KEYS.BASE64_INPUT_MODE,
    "text",
  );
  const [input, setInput] = usePersistedState(STORAGE_KEYS.BASE64_INPUT, base64Config.example);
  const [mode, setMode] = usePersistedState<Base64Mode>(STORAGE_KEYS.BASE64_MODE, "auto");
  const [storedOptions, setOptions] = usePersistedState<Base64Options>(
    STORAGE_KEYS.BASE64_OPTIONS,
    defaultBase64Options,
  );
  const options = useMemo(
    () => ({ ...defaultBase64Options, ...storedOptions }),
    [storedOptions],
  );
  const [fileState, setFileState] = useState<FileState>(null);
  const latestFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clipboardError, setClipboardError] = useState(false);
  const clipboardErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clipboardErrorTimerRef.current !== null) clearTimeout(clipboardErrorTimerRef.current);
    };
  }, []);

  const deferredInput = useDeferredValue(input);
  const effectiveMode = resolveMode(mode, deferredInput);

  const result = useMemo<Base64Result>(() => {
    if (inputMode === "file") {
      if (!fileState) return { ok: true, value: "" };
      return { ok: true, value: encode(fileState.bytes, options) };
    }
    try {
      const value =
        effectiveMode === "encode"
          ? encodeText(deferredInput, options)
          : decodeText(deferredInput);
      return { ok: true, value };
    } catch (error) {
      if (error instanceof Base64Error) {
        return { ok: false, code: error.code };
      }
      throw error;
    }
  }, [inputMode, fileState, effectiveMode, deferredInput, options]);

  const handleOptionChange = useCallback(
    (key: keyof Base64Options, value: boolean) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [setOptions],
  );

  const handleFile = useCallback((file: File) => {
    latestFileRef.current = file;
    void file.arrayBuffer().then((buffer) => {
      if (latestFileRef.current !== file) return; // stale resolution, a newer file was selected
      setFileState({ file, bytes: new Uint8Array(buffer) });
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleChangeFile = useCallback(() => {
    latestFileRef.current = null;
    setFileState(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result.ok || !result.value) return;
    try {
      await navigator.clipboard.writeText(result.value);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
      setClipboardError(true);
      if (clipboardErrorTimerRef.current !== null) clearTimeout(clipboardErrorTimerRef.current);
      clipboardErrorTimerRef.current = setTimeout(() => setClipboardError(false), 2000);
    }
  }, [result]);

  const handleClear = useCallback(() => {
    setInput("");
    setFileState(null);
  }, [setInput]);

  const canSwap = inputMode === "text" && result.ok && result.value !== "";

  const handleSwap = useCallback(() => {
    if (!canSwap || !result.ok) return;
    setInput(result.value);
    setMode(effectiveMode === "encode" ? "decode" : "encode");
  }, [canSwap, result, effectiveMode, setInput, setMode]);

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Input type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={inputMode === "text"}
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "text"
              ? "bg-cyan-500 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          {t("base64.inputTypeText")}
        </button>
        <button
          type="button"
          aria-pressed={inputMode === "file"}
          onClick={() => setInputMode("file")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            inputMode === "file"
              ? "bg-cyan-500 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          {t("base64.inputTypeFile")}
        </button>
      </div>

      {/* Mode selector (text mode only — file mode is encode-only) */}
      {inputMode === "text" && (
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={mode === "auto"}
            onClick={() => setMode("auto")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === "auto"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {mode === "auto"
              ? t("base64.modeAutoDetected", { mode: effectiveMode })
              : t("base64.modeAuto")}
          </button>
          <button
            type="button"
            aria-pressed={mode === "encode"}
            onClick={() => setMode("encode")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === "encode"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {t("base64.modeEncode")}
          </button>
          <button
            type="button"
            aria-pressed={mode === "decode"}
            onClick={() => setMode("decode")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === "decode"
                ? "bg-cyan-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {t("base64.modeDecode")}
          </button>
        </div>
      )}

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="checkbox"
            checked={options.urlSafe}
            onChange={(e) => handleOptionChange("urlSafe", e.target.checked)}
            className="w-4 h-4 rounded bg-white/10 border-white/20"
          />
          {t("base64.urlSafe")}
        </label>
        <label className="flex items-center gap-2 text-gray-300">
          <input
            type="checkbox"
            checked={options.padding}
            onChange={(e) => handleOptionChange("padding", e.target.checked)}
            className="w-4 h-4 rounded bg-white/10 border-white/20"
          />
          {t("base64.padding")}
        </label>
      </div>

      {/* Input */}
      {inputMode === "text" ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="base64-input" className="text-gray-300 font-medium">
            {t("base64.inputLabel")}
          </label>
          <textarea
            id="base64-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              effectiveMode === "encode"
                ? t("base64.inputPlaceholderEncode")
                : t("base64.inputPlaceholderDecode")
            }
            aria-invalid={!result.ok}
            aria-describedby={!result.ok ? "base64-error" : undefined}
            className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            {...(!fileState && {
              onClick: () => fileInputRef.current?.click(),
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              },
              role: "button" as const,
              tabIndex: 0,
              "aria-label": t("base64.fileDropLabel"),
            })}
            className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
          >
            {fileState ? (
              <div className="text-center">
                <p className="text-white font-medium">{fileState.file.name}</p>
                <p className="text-gray-400 text-sm">
                  {(fileState.file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangeFile();
                  }}
                  className="text-cyan-400 text-sm mt-2 hover:underline"
                >
                  {t("base64.changeFile")}
                </button>
              </div>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                <p className="text-gray-400">{t("base64.dropFileHere")}</p>
              </>
            )}
          </div>
        </div>
      )}

      {!result.ok && (
        <p id="base64-error" role="alert" className="text-red-400 text-sm">
          {t(ERROR_KEYS[result.code])}
        </p>
      )}

      {/* Output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">{t("base64.outputLabel")}</span>
          <div className="flex gap-2">
            {inputMode === "text" && (
              <button
                type="button"
                onClick={handleSwap}
                disabled={!canSwap}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <i className="fas fa-exchange-alt mr-1"></i>
                {t("base64.swap")}
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result.ok || !result.value}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <i className="fas fa-copy mr-1"></i>
              {t("base64.copy")}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <i className="fas fa-eraser mr-1"></i>
              {t("base64.clear")}
            </button>
          </div>
        </div>
        <textarea
          value={result.ok ? result.value : ""}
          readOnly
          aria-label={t("base64.outputLabel")}
          placeholder={t("base64.outputPlaceholder")}
          className="w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400"
          spellCheck={false}
        />
      </div>

      {clipboardError && <p className="text-red-400 text-sm">{t("base64.copyError")}</p>}
    </div>
  );
}

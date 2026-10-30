import { useState, useCallback, useRef, useMemo, useDeferredValue } from "react";
import { useTranslation } from "react-i18next";
import { base64Config } from "./base64.config";
import {
  encode,
  encodeText,
  decodeText,
  resolveMode,
  defaultBase64Options,
  MAX_FILE_BYTES,
  Base64Error,
  type Base64Mode,
  type Base64Options,
  type Base64ErrorCode,
  type Base64InputMode,
} from "./base64.utils";
import { ToggleButtonGroup } from "@/components/common/ToggleButtonGroup";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { STORAGE_KEYS } from "@/services/storage";
import { formatBytes } from "@/utils/formatBytes";

type FileState = { file: File; bytes: Uint8Array } | null;

type FileErrorCode = "fileTooLarge" | "fileUnreadable";

type Base64Result =
  | { ok: true; value: string }
  | { ok: false; code: Base64ErrorCode | FileErrorCode };

const MAX_FILE_MB = MAX_FILE_BYTES / 1_000_000;

const ERROR_KEYS: Record<Base64ErrorCode | FileErrorCode, string> = {
  fileTooLarge: "base64.errorFileTooLarge",
  fileUnreadable: "base64.errorFileUnreadable",
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
  const [input, setInput, inputNotSaved] = usePersistedState(
    STORAGE_KEYS.BASE64_INPUT,
    base64Config.example,
  );
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
  const [fileError, setFileError] = useState<FileErrorCode | null>(null);
  const latestFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { copy, error: clipboardError } = useClipboardCopy();

  const deferredInput = useDeferredValue(input);
  const effectiveMode = resolveMode(mode, deferredInput);

  const result = useMemo<Base64Result>(() => {
    if (inputMode === "file") {
      if (fileError) return { ok: false, code: fileError };
      if (!fileState) return { ok: true, value: "" };
      try {
        return { ok: true, value: encode(fileState.bytes, options) };
      } catch {
        // e.g. RangeError: the output exceeds the max string length
        return { ok: false, code: "fileTooLarge" };
      }
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
  }, [inputMode, fileState, fileError, effectiveMode, deferredInput, options]);

  const handleOptionChange = useCallback(
    (key: keyof Base64Options, value: boolean) => {
      setOptions((prev) => ({ ...prev, [key]: value }));
    },
    [setOptions],
  );

  const handleFile = useCallback((file: File) => {
    latestFileRef.current = file;
    setFileState(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError("fileTooLarge");
      return;
    }
    setFileError(null);
    file.arrayBuffer().then(
      (buffer) => {
        if (latestFileRef.current !== file) return; // stale resolution, a newer file was selected
        setFileState({ file, bytes: new Uint8Array(buffer) });
      },
      () => {
        if (latestFileRef.current !== file) return;
        setFileError("fileUnreadable");
      },
    );
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

  // Without this the browser keeps the old selection and picking the same file
  // again fires no change event.
  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleChangeFile = useCallback(() => {
    latestFileRef.current = null;
    setFileState(null);
    setFileError(null);
    resetFileInput();
  }, [resetFileInput]);

  const handleCopy = useCallback(async () => {
    if (!result.ok || !result.value) return;
    await copy(result.value);
  }, [result, copy]);

  // Clear only touches the active input type: the typed text survives a
  // detour through file mode and vice versa.
  const handleClear = useCallback(() => {
    if (inputMode === "text") {
      setInput("");
      return;
    }
    latestFileRef.current = null; // drop any file read still in flight
    setFileState(null);
    setFileError(null);
    resetFileInput();
  }, [inputMode, setInput, resetFileInput]);

  // Decoding accepts both alphabets with or without padding, so the options
  // only apply when encoding.
  const optionsDisabled = inputMode === "text" && effectiveMode === "decode";

  const canSwap = inputMode === "text" && result.ok && result.value !== "";

  const handleSwap = useCallback(() => {
    if (!canSwap || !result.ok) return;
    setInput(result.value);
    setMode(effectiveMode === "encode" ? "decode" : "encode");
  }, [canSwap, result, effectiveMode, setInput, setMode]);

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Input type toggle */}
      <ToggleButtonGroup
        variant="segmented"
        ariaLabel={t("base64.inputTypeGroupLabel")}
        options={[
          { value: "text", label: t("base64.inputTypeText") },
          { value: "file", label: t("base64.inputTypeFile") },
        ]}
        value={inputMode}
        onChange={setInputMode}
      />

      {/* Mode selector (text mode only — file mode is encode-only) */}
      {inputMode === "text" && (
        <ToggleButtonGroup
          variant="segmented"
          ariaLabel={t("base64.modeGroupLabel")}
          options={[
            {
              value: "auto",
              label:
                mode === "auto"
                  ? t("base64.modeAutoDetected", {
                      // the translated direction, not the internal "encode"/"decode" token
                      mode: t(
                        effectiveMode === "encode" ? "base64.modeEncode" : "base64.modeDecode",
                      ),
                    })
                  : t("base64.modeAuto"),
            },
            { value: "encode", label: t("base64.modeEncode") },
            { value: "decode", label: t("base64.modeDecode") },
          ]}
          value={mode}
          onChange={setMode}
        />
      )}

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-gray-300 has-[:disabled]:opacity-50">
          <input
            type="checkbox"
            checked={options.urlSafe}
            onChange={(e) => handleOptionChange("urlSafe", e.target.checked)}
            disabled={optionsDisabled}
            className="w-4 h-4 rounded bg-white/10 border-white/20"
          />
          {t("base64.urlSafe")}
        </label>
        <label className="flex items-center gap-2 text-gray-300 has-[:disabled]:opacity-50">
          <input
            type="checkbox"
            checked={options.padding}
            onChange={(e) => handleOptionChange("padding", e.target.checked)}
            disabled={optionsDisabled}
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
          {inputNotSaved && (
            <p role="status" className="text-yellow-300 text-sm">
              {t("base64.inputNotSaved")}
            </p>
          )}
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
                  {formatBytes(fileState.file.size)}
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
          {t(ERROR_KEYS[result.code], { max: MAX_FILE_MB })}
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

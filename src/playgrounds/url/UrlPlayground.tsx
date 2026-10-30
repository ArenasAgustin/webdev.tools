import { useCallback, useEffect, useMemo, useDeferredValue, useState } from "react";
import { useTranslation } from "react-i18next";
import { urlConfig } from "./url.config";
import {
  encodeUrl,
  decodeUrl,
  resolveMode,
  isUrlMode,
  isUrlVariant,
  normalizeUrlOptions,
  defaultUrlOptions,
  UrlError,
  type UrlOptions,
  type UrlMode,
  type UrlVariant,
  type UrlErrorCode,
} from "./url.utils";
import { ToggleButtonGroup } from "@/components/common/ToggleButtonGroup";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { useToast } from "@/hooks/useToast";
import { STORAGE_KEYS, removeItem } from "@/services/storage";

type UrlResult = { ok: true; value: string } | { ok: false; code: UrlErrorCode };

const ERROR_KEYS: Record<UrlErrorCode, string> = {
  malformedSequence: "url.errorMalformedSequence",
  invalidSurrogate: "url.errorInvalidSurrogate",
};

const TEXTAREA_CLASS =
  "w-full h-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400";
const ACTION_BUTTON_CLASS =
  "px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50";

export function UrlPlayground() {
  const { t } = useTranslation();
  const [rawMode, setMode] = usePersistedState<UrlMode>(STORAGE_KEYS.URL_MODE, "auto");
  const mode: UrlMode = isUrlMode(rawMode) ? rawMode : "auto";
  const [rawVariant, setVariant] = usePersistedState<UrlVariant>(
    STORAGE_KEYS.URL_VARIANT,
    "component",
  );
  const variant: UrlVariant = isUrlVariant(rawVariant) ? rawVariant : "component";
  // URLs often carry tokens or session ids in their query, so the text is never
  // persisted: only the non-sensitive options survive a reload.
  const [input, setInput] = useState(urlConfig.example);

  const [storedOptions, setOptions] = usePersistedState<UrlOptions>(
    STORAGE_KEYS.URL_OPTIONS,
    defaultUrlOptions,
  );
  const options = useMemo(() => normalizeUrlOptions(storedOptions), [storedOptions]);

  const { copy } = useClipboardCopy();
  const toast = useToast();

  // Purge the input copy that earlier versions stored on disk
  useEffect(() => {
    removeItem(STORAGE_KEYS.URL_INPUT);
  }, []);

  const deferredInput = useDeferredValue(input);
  const effectiveMode = resolveMode(mode, deferredInput, variant);

  const result = useMemo<UrlResult>(() => {
    try {
      const value =
        effectiveMode === "encode"
          ? encodeUrl(deferredInput, variant, options)
          : decodeUrl(deferredInput, variant);
      return { ok: true, value };
    } catch (error) {
      if (error instanceof UrlError) {
        return { ok: false, code: error.code };
      }
      throw error;
    }
  }, [effectiveMode, deferredInput, variant, options]);

  const canUseOutput = result.ok && result.value !== "";

  const handleCopy = useCallback(async () => {
    if (!result.ok || !result.value) return;
    if (await copy(result.value)) {
      toast.success(t("url.copied"));
    } else {
      toast.error(t("url.copyError"));
    }
  }, [result, copy, toast, t]);

  const handleClear = useCallback(() => {
    setInput("");
  }, [setInput]);

  const handleSwap = useCallback(() => {
    // Recompute from the live input: the rendered result may lag behind (deferred value)
    const direction = resolveMode(mode, input, variant);
    let value: string;
    try {
      value =
        direction === "encode" ? encodeUrl(input, variant, options) : decodeUrl(input, variant);
    } catch (error) {
      if (error instanceof UrlError) return;
      throw error;
    }
    if (!value) return;
    const flipped = direction === "encode" ? "decode" : "encode";
    setInput(value);
    // Auto stays auto when it already detects the flipped direction for the new input
    if (mode !== "auto" || resolveMode("auto", value, variant) !== flipped) {
      setMode(flipped);
    }
  }, [mode, input, variant, options, setInput, setMode]);

  const handleStrictChange = useCallback(
    (strict: boolean) => setOptions({ ...options, strict }),
    [options, setOptions],
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      <ToggleButtonGroup
        variant="segmented"
        ariaLabel={t("url.modeGroupLabel")}
        options={[
          {
            value: "auto",
            label:
              mode === "auto"
                ? t("url.modeAutoDetected", {
                    // the translated direction, not the internal "encode"/"decode" token
                    mode: t(effectiveMode === "encode" ? "url.modeEncode" : "url.modeDecode"),
                  })
                : t("url.modeAuto"),
          },
          { value: "encode", label: t("url.modeEncode") },
          { value: "decode", label: t("url.modeDecode") },
        ]}
        value={mode}
        onChange={setMode}
      />

      <ToggleButtonGroup
        variant="segmented"
        ariaLabel={t("url.variantGroupLabel")}
        options={[
          { value: "component", label: t("url.variantComponent") },
          { value: "uri", label: t("url.variantUri") },
          { value: "form", label: t("url.variantForm") },
        ]}
        value={variant}
        onChange={setVariant}
      />

      <label className="flex items-center gap-2 text-gray-300">
        <input
          type="checkbox"
          checked={options.strict}
          disabled={variant === "uri"}
          onChange={(e) => handleStrictChange(e.target.checked)}
          className="w-4 h-4 rounded bg-white/10 border-white/20 disabled:opacity-50"
        />
        {t("url.strict")}
      </label>

      <div className="flex flex-col gap-2">
        <label htmlFor="url-input" className="text-gray-300 font-medium">
          {t("url.inputLabel")}
        </label>
        <textarea
          id="url-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            effectiveMode === "encode"
              ? t("url.inputPlaceholderEncode")
              : t("url.inputPlaceholderDecode")
          }
          aria-invalid={!result.ok}
          aria-describedby={!result.ok ? "url-error" : undefined}
          className={TEXTAREA_CLASS}
          spellCheck={false}
        />
      </div>

      {!result.ok && (
        <p id="url-error" role="alert" className="text-red-400 text-sm">
          {t(ERROR_KEYS[result.code])}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 font-medium">{t("url.outputLabel")}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!canUseOutput}
              className={ACTION_BUTTON_CLASS}
            >
              <i className="fas fa-copy mr-1"></i>
              {t("url.copy")}
            </button>
            <button
              type="button"
              onClick={handleSwap}
              disabled={!canUseOutput}
              className={ACTION_BUTTON_CLASS}
            >
              <i className="fas fa-exchange-alt mr-1"></i>
              {t("url.swap")}
            </button>
            <button type="button" onClick={handleClear} className={ACTION_BUTTON_CLASS}>
              <i className="fas fa-eraser mr-1"></i>
              {t("url.clear")}
            </button>
          </div>
        </div>
        <textarea
          value={result.ok ? result.value : ""}
          readOnly
          aria-label={t("url.outputLabel")}
          placeholder={t("url.outputPlaceholder")}
          className={TEXTAREA_CLASS}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

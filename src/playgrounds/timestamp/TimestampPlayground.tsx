import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { timestampConfig } from "./timestamp.config";
import {
  convertTimestamp,
  getCurrentTimestamp,
  withUtc,
  type TimestampResult,
  type UnixUnit,
} from "./timestamp.utils";
import { useToast } from "@/hooks/useToast";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { usePersistedState } from "@/hooks/usePersistedState";
import { STORAGE_KEYS } from "@/services/storage";

const ALL_TIMEZONES: string[] = withUtc(
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Los_Angeles",
        "America/Argentina/Buenos_Aires",
        "Europe/London",
        "Europe/Paris",
        "Asia/Kolkata",
        "Asia/Singapore",
        "Asia/Shanghai",
        "Asia/Tokyo",
        "Australia/Sydney",
      ],
);

const UNIT_KEYS: Record<UnixUnit, string> = {
  seconds: "timestamp.unitSeconds",
  milliseconds: "timestamp.unitMilliseconds",
};

/** How often the relative time is refreshed while a result is shown, in ms. */
const RELATIVE_TICK_MS = 1000;

export function TimestampPlayground() {
  const { t, i18n } = useTranslation();
  // resolvedLanguage is the translation in use (en for en-US, and the English
  // fallback for fr-FR); the raw detected language would read those as Spanish.
  const lang = (i18n.resolvedLanguage ?? i18n.language) === "es" ? "es" : "en";
  const toast = useToast();
  const { copy } = useClipboardCopy();
  const [input, setInput] = usePersistedState(
    STORAGE_KEYS.TIMESTAMP_INPUT,
    timestampConfig.example,
  );
  // The input that was last converted; the result is derived from it so a timezone or
  // language change refreshes the shown formats without converting again.
  const [convertedInput, setConvertedInput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timezone, setTimezone] = usePersistedState(
    STORAGE_KEYS.TIMESTAMP_TIMEZONE,
    "America/Argentina/Buenos_Aires",
  );

  // Reference clock for the relative time; refreshed every second while a result is
  // shown so "5 seconds ago" keeps moving instead of freezing at conversion time.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (convertedInput === null) return;
    const id = setInterval(() => setNow(Date.now()), RELATIVE_TICK_MS);
    return () => clearInterval(id);
  }, [convertedInput]);

  const result = useMemo<TimestampResult | null>(
    () =>
      convertedInput === null ? null : convertTimestamp(convertedInput, timezone, lang, now),
    [convertedInput, timezone, lang, now],
  );

  const handleConvert = useCallback(() => {
    setError(null);

    if (!input.trim()) {
      setConvertedInput(null);
      return;
    }

    if (convertTimestamp(input, timezone, lang)) {
      setNow(Date.now());
      setConvertedInput(input);
    } else {
      setError(t("timestamp.invalidInput"));
      setConvertedInput(null);
    }
  }, [input, timezone, lang, t]);

  const handleNow = useCallback(() => {
    const current = String(getCurrentTimestamp());
    setInput(current);
    setError(null);
    setNow(Date.now());
    setConvertedInput(current);
  }, [setInput]);

  const handleClear = useCallback(() => {
    setInput("");
    setConvertedInput(null);
    setError(null);
  }, [setInput]);

  const copyToClipboard = useCallback(
    async (value: string) => {
      if (await copy(value)) {
        toast.success(t("timestamp.copied"));
      } else {
        toast.error(t("timestamp.copyError"));
      }
    },
    [copy, toast, t],
  );

  const formatLabels: { key: keyof TimestampResult; label: string }[] = useMemo(
    () => [
      { key: "unixSeconds", label: t("timestamp.formats.unixSeconds") },
      { key: "unixMilliseconds", label: t("timestamp.formats.unixMilliseconds") },
      { key: "iso8601", label: t("timestamp.formats.iso8601") },
      { key: "rfc2822", label: t("timestamp.formats.rfc2822") },
      { key: "humanReadable", label: t("timestamp.formats.humanReadable") },
      { key: "relative", label: t("timestamp.formats.relative") },
    ],
    [t],
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col gap-4">
      {/* Input Section */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleConvert()}
          placeholder={t("timestamp.placeholder")}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-3 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
          spellCheck={false}
        />

        {/* Timezone selector */}
        <div className="flex items-center gap-2">
          <label className="text-gray-300 text-sm">{t("timestamp.timezoneLabel")}:</label>
          <SearchableSelect
            value={timezone}
            onChange={setTimezone}
            options={ALL_TIMEZONES}
            placeholder={t("timestamp.searchTimezone")}
            noResultsLabel={t("timestamp.noResults")}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleConvert}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-exchange-alt mr-2"></i>
            {t("timestamp.convert")}
          </button>
          <button
            type="button"
            onClick={handleNow}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-clock mr-2"></i>
            {t("timestamp.now")}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-trash-alt mr-2"></i>
            {t("common.clear")}
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
          {result.isFuture && (
            <div className="p-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300 text-sm">
              ⏱️ {t("timestamp.futureDate")}
            </div>
          )}

          {result.unit && (
            <p className="text-gray-400 text-sm">
              {t("timestamp.detectedUnit", { unit: t(UNIT_KEYS[result.unit]) })}
            </p>
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
                title={t("common.copy")}
                aria-label={`${t("common.copy")} ${label}`}
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

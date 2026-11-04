import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { HexColorPicker } from "react-colorful";
import { colorsConfig } from "./colors.config";
import { convertColor, getAllFormats, type ColorFormats } from "@/utils/colorConverter";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { useToast } from "@/hooks/useToast";
import { STORAGE_KEYS } from "@/services/storage";

// Every format row with no value, shown while the text input holds no valid color.
const EMPTY_FORMATS = Object.fromEntries(
  Object.keys(getAllFormats({ r: 0, g: 0, b: 0 })).map((format) => [format, ""]),
) as unknown as ColorFormats;

export function ColorsPlayground() {
  const { t } = useTranslation();
  const pickerRef = useRef<HTMLDivElement>(null);

  // react-colorful hardcodes English slider names ("Color", "Hue") and takes no
  // label props; React never rewrites them, so set the translated names here.
  useEffect(() => {
    const [saturation, hue] = pickerRef.current?.querySelectorAll('[role="slider"]') ?? [];
    saturation?.setAttribute("aria-label", t("colors.saturationLabel"));
    hue?.setAttribute("aria-label", t("colors.hueLabel"));
  }, [t]);
  // Only valid colors are persisted; the text box itself may hold an invalid draft.
  const [savedInput, setStoredInput] = usePersistedState<unknown>(
    STORAGE_KEYS.COLORS_INPUT,
    colorsConfig.example,
  );
  // Storage is user-editable: a non-string value (hand-edited, or written by another
  // version) would crash on .trim() and loop the ErrorBoundary, so use the default.
  const storedInput = typeof savedInput === "string" ? savedInput : colorsConfig.example;
  const [input, setInput] = useState(storedInput);
  // Derive initial color from the stored input (already loaded by usePersistedState above).
  // React guarantees sequential useState execution, so it is populated before
  // this lazy initializer runs. Avoids a redundant getItem call.
  const [color, setColor] = useState<string>(() => convertColor(storedInput)?.hex ?? "#3498db");

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      try {
        const formats = convertColor(value);
        if (formats) {
          setColor(formats.hex);
          setStoredInput(value);
        }
      } catch (err) {
        console.warn("Invalid color input:", err);
      }
    },
    [setStoredInput],
  );

  const handleColorChange = useCallback(
    (newColor: string) => {
      setColor(newColor);
      setInput(newColor);
      setStoredInput(newColor);
    },
    [setStoredInput],
  );

  // Invalid or empty text shows no values, so a stale color cannot be copied by
  // mistake; the picker and swatch keep the last valid color to edit from.
  const inputFormats = convertColor(input);
  const isInvalid = input.trim() !== "" && inputFormats === null;
  const displayFormats: ColorFormats = inputFormats ?? EMPTY_FORMATS;

  const { copy } = useClipboardCopy();
  const toast = useToast();
  const copyToClipboard = useCallback(
    async (value: string) => {
      if (await copy(value)) {
        toast.success(t("colors.copied"));
      } else {
        toast.error(t("colors.copyError"));
      }
    },
    [copy, toast, t],
  );

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col lg:flex-row gap-4">
      {/* Left: Color picker + text input */}
      <div className="flex flex-col gap-4 lg:w-1/2">
        <div ref={pickerRef}>
          <HexColorPicker color={color} onChange={handleColorChange} className="!w-full" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
          placeholder={t("colors.placeholder")}
          aria-label={t("colors.inputLabel")}
          spellCheck={false}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? "colors-input-error" : undefined}
        />
        {isInvalid && (
          <p id="colors-input-error" role="alert" className="text-red-400 text-sm">
            {t("colors.invalidColor")}
          </p>
        )}
        {/* Preview swatch */}
        <div
          className="w-full h-16 rounded-xl border border-white/20 shadow-lg"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Right: Formats */}
      <div className="flex flex-col gap-2 lg:w-1/2">
        {displayFormats &&
          (Object.entries(displayFormats) as [string, string][]).map(([format, value]) => (
            <div
              key={format}
              className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-xs font-mono text-gray-400 uppercase w-14">{format}</span>
              <code className="text-sm text-white font-mono flex-1 text-right select-all">
                {value || "—"}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(value)}
                disabled={!value}
                className="ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-400 hover:text-white transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title={t("colors.copy", { format })}
                aria-label={t("colors.copy", { format })}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { HexColorPicker } from "react-colorful";
import { colorsConfig } from "./colors.config";
import { convertColor, getAllFormats, type ColorFormats } from "@/utils/colorConverter";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useClipboardCopy } from "@/hooks/useClipboardCopy";
import { STORAGE_KEYS } from "@/services/storage";

export function ColorsPlayground() {
  const { t } = useTranslation();
  // Only valid colors are persisted; the text box itself may hold an invalid draft.
  const [storedInput, setStoredInput] = usePersistedState(
    STORAGE_KEYS.COLORS_INPUT,
    colorsConfig.example,
  );
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

  // While the text input is invalid, keep showing the last valid color (hex, possibly with alpha).
  const inputFormats = convertColor(input);
  const isInvalid = input.trim() !== "" && inputFormats === null;
  const displayFormats: ColorFormats =
    inputFormats ?? convertColor(color) ?? getAllFormats({ r: 0, g: 0, b: 0 });

  const { copy: copyToClipboard } = useClipboardCopy();

  return (
    <div className="flex flex-1 min-h-0 overflow-y-auto flex-col lg:flex-row gap-4">
      {/* Left: Color picker + text input */}
      <div className="flex flex-col gap-4 lg:w-1/2">
        <HexColorPicker color={color} onChange={handleColorChange} className="!w-full" />
        <input
          type="text"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-center focus:outline-none focus:ring-1 focus:ring-cyan-400"
          placeholder={t("colors.placeholder")}
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
                {value}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(value)}
                className="ml-3 text-gray-400 hover:text-white transition-colors"
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

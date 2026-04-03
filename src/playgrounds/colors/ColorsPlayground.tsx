import { useState, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { colorsConfig } from "./colors.config";
import { convertColor, getAllFormats, type ColorFormats } from "@/utils/colorConverter";

export function ColorsPlayground() {
  const [input, setInput] = useState(colorsConfig.example);
  const [color, setColor] = useState("#3498db");

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    try {
      const formats = convertColor(value);
      if (formats) {
        setColor(formats.hex);
      }
    } catch (err) {
      console.warn("Invalid color input:", err);
    }
  }, []);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    setInput(newColor);
  }, []);

  function getAllFormatsFromHex(hex: string): ColorFormats {
    const cleanHex = hex.startsWith("#") ? hex : "#" + hex;
    const r = parseInt(cleanHex.slice(1, 3), 16);
    const g = parseInt(cleanHex.slice(3, 5), 16);
    const b = parseInt(cleanHex.slice(5, 7), 16);
    return getAllFormats({ r, g, b });
  }

  const parsed = convertColor(input);
  const displayFormats = parsed ?? getAllFormatsFromHex(color);

  const copyToClipboard = useCallback((value: string) => {
    try {
      navigator.clipboard.writeText(value);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
    }
  }, []);

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
          placeholder="HEX, RGB, HSL, HSV, CMYK..."
          spellCheck={false}
        />
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
                title="Copiar"
                aria-label={`Copiar ${format}`}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

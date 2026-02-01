import { useMemo } from "react";

interface TextStats {
  lines: number;
  characters: number;
  bytes: number;
}

/**
 * Hook to calculate text statistics
 * Returns lines, characters, and bytes count
 */
export function useTextStats(text: string): TextStats {
  return useMemo(() => {
    if (!text) {
      return { lines: 0, characters: 0, bytes: 0 };
    }

    const lines = text.split("\n").length;
    const characters = text.length;
    const bytes = new Blob([text]).size;

    return { lines, characters, bytes };
  }, [text]);
}

import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { usePhpParser } from "@/hooks/usePhpParser";

describe("usePhpParser", () => {
  it("reports a syntax error with a single prefix and without parser noise", async () => {
    const { result } = renderHook(() => usePhpParser("<?php\n$a = ;"));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    const message = result.current.error?.message ?? "";
    expect(message).toMatch(/^Error de sintaxis en línea 2: /);
    expect(message.match(/sintaxis/gi)).toHaveLength(1);
    expect(message).not.toMatch(/Parse Error|on line \d+$/);
  });
});

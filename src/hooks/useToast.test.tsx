import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ToastProvider } from "@/context/ToastContext";
import { useToast } from "./useToast";

describe("useToast", () => {
  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useToast())).toThrow(
      "useToast must be used within ToastProvider",
    );
  });

  it("exposes success, error and info helpers inside provider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ToastProvider>{children}</ToastProvider>
    );

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(typeof result.current.success).toBe("function");
    expect(typeof result.current.error).toBe("function");
    expect(typeof result.current.info).toBe("function");
  });
});

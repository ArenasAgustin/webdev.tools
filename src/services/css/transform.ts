import type { Result } from "@/types/common";
import type { IndentStyle } from "@/types/format";
import { formatWithPrettier } from "@/services/formatter/prettier";
import lightningcssWasmUrl from "lightningcss-wasm/lightningcss_node.wasm?url";

interface LightningTransformResult {
  code: Uint8Array;
}

interface LightningTransformOptions {
  filename: string;
  code: Uint8Array;
  minify?: boolean;
}

interface LightningCssModule {
  default: (input?: string | URL | Request | BufferSource) => Promise<void>;
  transform: (options: LightningTransformOptions) => LightningTransformResult;
}

let lightningcssModulePromise: Promise<LightningCssModule> | null = null;

interface CssMinifyOptions {
  removeComments?: boolean;
  removeSpaces?: boolean;
}

export async function formatCss(
  input: string,
  indentSize: IndentStyle = 2,
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const formatted = await formatWithPrettier(input, "css", indentSize);
    return { ok: true, value: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

export async function minifyCss(
  input: string,
  options: CssMinifyOptions = {},
): Promise<Result<string, string>> {
  try {
    if (!input.trim()) {
      return { ok: true, value: "" };
    }

    const removeComments = options.removeComments ?? true;
    const removeSpaces = options.removeSpaces ?? true;
    const source = removeComments ? stripComments(input) : input;

    if (!removeSpaces) {
      return {
        ok: true,
        value: source.trim(),
      };
    }

    const lightning = await loadLightningCss();
    const encodedInput = new TextEncoder().encode(source);
    const result = lightning.transform({
      filename: "input.css",
      code: encodedInput,
      minify: true,
    });
    const output = new TextDecoder().decode(result.code);

    return {
      ok: true,
      value: output.trim(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message || "Error al minificar CSS" };
  }
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "");
}

async function loadLightningCss(): Promise<LightningCssModule> {
  if (lightningcssModulePromise) {
    return lightningcssModulePromise;
  }

  lightningcssModulePromise = (async () => {
    const moduleValue = (await import("lightningcss-wasm")) as unknown as LightningCssModule;

    try {
      const wasmBytes = await fetchWasmBytes(lightningcssWasmUrl);
      // Cast to BufferSource to satisfy TypeScript type checking
      await moduleValue.default(wasmBytes.buffer as BufferSource);
    } catch {
      await moduleValue.default();
    }

    return moduleValue;
  })();

  return lightningcssModulePromise;
}

async function fetchWasmBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo descargar WASM (${response.status})`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  if (bytes.length < 4 || bytes[0] !== 0x00 || bytes[1] !== 0x61 || bytes[2] !== 0x73 || bytes[3] !== 0x6d) {
    throw new Error("La respuesta no es un binario WASM válido");
  }

  return bytes;
}

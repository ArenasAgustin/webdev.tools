import { describe, expect, it } from "vitest";
import { parseServiceMessage, serviceMessage } from "@/services/serviceMessage";
import { localizeServiceError, localizeServiceMessage } from "@/services/localizeServiceMessage";

describe("serviceMessage", () => {
  it("encodes a bare key as the key itself", () => {
    expect(serviceMessage("services.json.empty")).toBe("services.json.empty");
    expect(parseServiceMessage("services.json.empty")).toEqual({ key: "services.json.empty" });
  });

  it("round-trips params", () => {
    const encoded = serviceMessage("services.php.syntaxErrorAtLine", { line: 3, message: "x" });
    expect(parseServiceMessage(encoded)).toEqual({
      key: "services.php.syntaxErrorAtLine",
      params: { line: 3, message: "x" },
    });
  });

  it("ignores text that is not a service message", () => {
    expect(parseServiceMessage("Unexpected token } in JSON")).toBeNull();
    expect(parseServiceMessage("services. not a key")).toBeNull();
    expect(parseServiceMessage("services.json.empty\u001Fnot-json")).toBeNull();
  });
});

describe("localizeServiceMessage", () => {
  it("translates known keys with params", () => {
    const encoded = serviceMessage("services.json.cleanError", { message: "boom" });
    expect(localizeServiceMessage(encoded)).toBe("Error al limpiar JSON: boom");
  });

  it("passes unknown keys and plain text through unchanged", () => {
    expect(localizeServiceMessage("services.unknown.key")).toBe("services.unknown.key");
    expect(localizeServiceMessage("Unexpected end of input")).toBe("Unexpected end of input");
  });

  it("keeps the error shape while localizing its message", () => {
    expect(localizeServiceError({ message: "services.sql.empty", line: 2 })).toEqual({
      message: "El SQL está vacío",
      line: 2,
    });
    expect(localizeServiceError("services.sql.empty")).toBe("El SQL está vacío");
  });
});

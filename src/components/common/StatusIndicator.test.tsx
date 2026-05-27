import { describe, it, expect } from "vitest";
import { renderWithI18n } from "@/test/test-utils";
import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  describe("input validation mode (with isValid)", () => {
    it("renders waiting label when value is empty", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value=""
          isValid={true}
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
        />,
      );

      expect(renderResult.getByText("Esperando CSS...")).toBeInTheDocument();
    });

    it("renders valid label with icon when isValid is true", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator value="body { color: red; }" isValid={true} validLabel="CSS válido" />,
      );

      expect(renderResult.getByText(/CSS válido/)).toBeInTheDocument();
    });

    it("renders error message when isValid is false with object error", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value="invalid {"
          isValid={false}
          error={{ message: "Unexpected token" }}
          invalidLabel="CSS inválido"
        />,
      );

      expect(renderResult.getByText(/Unexpected token/)).toBeInTheDocument();
    });

    it("renders invalidLabel when isValid is false with no error message", () => {
      const renderResult = renderWithI18n(<StatusIndicator value="invalid {" isValid={false} invalidLabel="CSS inválido" />);

      expect(renderResult.getByText(/CSS inválido/)).toBeInTheDocument();
    });

    it("renders warning alongside status", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value="body {}"
          isValid={true}
          validLabel="CSS válido"
          warning="Input truncated"
        />,
      );

      expect(renderResult.getByText("Input truncated")).toBeInTheDocument();
    });

    it("renders validExtra in valid state", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value="body {}"
          isValid={true}
          validLabel="CSS válido"
          validExtra={<span>5 líneas</span>}
        />,
      );

      expect(renderResult.getByText("5 líneas")).toBeInTheDocument();
    });

    it("truncates error when truncateError is true", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value="invalid"
          isValid={false}
          error={{ message: "Very long error message" }}
          truncateError={true}
        />,
      );

      const errorSpan = renderResult.getByTitle("Very long error message");
      expect(errorSpan).toBeInTheDocument();
    });
  });

  describe("output mode (without isValid)", () => {
    it("renders waiting label when value is empty", () => {
      const renderResult = renderWithI18n(<StatusIndicator value="" waitingLabel="Esperando operación..." />);

      expect(renderResult.getByText("Esperando operación...")).toBeInTheDocument();
    });

    it("renders string error when provided", () => {
      const renderResult = renderWithI18n(<StatusIndicator value="" error="Format failed" />);

      expect(renderResult.getByText(/Format failed/)).toBeInTheDocument();
    });

    it("renders validExtra when value is non-empty and no error", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator
          value="output content"
          showValidLabel={false}
          validExtra={<span>3 líneas</span>}
        />,
      );

      expect(renderResult.getByText("3 líneas")).toBeInTheDocument();
    });

    it("renders valid label when showValidLabel is true", () => {
      const renderResult = renderWithI18n(
        <StatusIndicator value="output content" showValidLabel={true} validLabel="JSON válido" />,
      );

      expect(renderResult.getByText(/JSON válido/)).toBeInTheDocument();
    });

  it("hides valid label when showValidLabel is false", () => {
    const renderResult = renderWithI18n(
      <StatusIndicator
        value="{}"
        error={null}
        showValidLabel={false}
        validLabel="JSON válido"
      />,
    );
    expect(renderResult.queryByText("JSON válido")).not.toBeInTheDocument();
  });
  });

  describe("wrapper", () => {
    it("wraps content in a div when withWrapper is true", () => {
      const { container } = renderWithI18n(
        <StatusIndicator value="" waitingLabel="Esperando..." withWrapper />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper.className).toContain("text-xs");
    });

    it("adds flex class when withFlex is true", () => {
      const { container } = renderWithI18n(
        <StatusIndicator value="" waitingLabel="Esperando..." withWrapper withFlex />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("flex");
    });
  });
});

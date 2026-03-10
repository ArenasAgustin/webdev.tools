import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  describe("input validation mode (with isValid)", () => {
    it("renders waiting label when value is empty", () => {
      render(
        <StatusIndicator
          value=""
          isValid={true}
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
        />,
      );

      expect(screen.getByText("Esperando CSS...")).toBeInTheDocument();
    });

    it("renders valid label with icon when isValid is true", () => {
      render(
        <StatusIndicator value="body { color: red; }" isValid={true} validLabel="CSS válido" />,
      );

      expect(screen.getByText(/CSS válido/)).toBeInTheDocument();
    });

    it("renders error message when isValid is false with object error", () => {
      render(
        <StatusIndicator
          value="invalid {"
          isValid={false}
          error={{ message: "Unexpected token" }}
          invalidLabel="CSS inválido"
        />,
      );

      expect(screen.getByText(/Unexpected token/)).toBeInTheDocument();
    });

    it("renders invalidLabel when isValid is false with no error message", () => {
      render(<StatusIndicator value="invalid {" isValid={false} invalidLabel="CSS inválido" />);

      expect(screen.getByText(/CSS inválido/)).toBeInTheDocument();
    });

    it("renders warning alongside status", () => {
      render(
        <StatusIndicator
          value="body {}"
          isValid={true}
          validLabel="CSS válido"
          warning="Input truncated"
        />,
      );

      expect(screen.getByText("Input truncated")).toBeInTheDocument();
    });

    it("renders validExtra in valid state", () => {
      render(
        <StatusIndicator
          value="body {}"
          isValid={true}
          validLabel="CSS válido"
          validExtra={<span>5 líneas</span>}
        />,
      );

      expect(screen.getByText("5 líneas")).toBeInTheDocument();
    });

    it("truncates error when truncateError is true", () => {
      render(
        <StatusIndicator
          value="invalid"
          isValid={false}
          error={{ message: "Very long error message" }}
          truncateError={true}
        />,
      );

      const errorSpan = screen.getByTitle("Very long error message");
      expect(errorSpan).toBeInTheDocument();
    });
  });

  describe("output mode (without isValid)", () => {
    it("renders waiting label when value is empty", () => {
      render(<StatusIndicator value="" waitingLabel="Esperando operación..." />);

      expect(screen.getByText("Esperando operación...")).toBeInTheDocument();
    });

    it("renders string error when provided", () => {
      render(<StatusIndicator value="" error="Format failed" />);

      expect(screen.getByText(/Format failed/)).toBeInTheDocument();
    });

    it("renders validExtra when value is non-empty and no error", () => {
      render(
        <StatusIndicator
          value="output content"
          showValidLabel={false}
          validExtra={<span>3 líneas</span>}
        />,
      );

      expect(screen.getByText("3 líneas")).toBeInTheDocument();
    });

    it("renders valid label when showValidLabel is true", () => {
      render(
        <StatusIndicator value="output content" showValidLabel={true} validLabel="JSON válido" />,
      );

      expect(screen.getByText(/JSON válido/)).toBeInTheDocument();
    });

    it("hides valid label when showValidLabel is false", () => {
      render(
        <StatusIndicator value="output content" showValidLabel={false} validLabel="JSON válido" />,
      );

      expect(screen.queryByText(/JSON válido/)).not.toBeInTheDocument();
    });
  });

  describe("wrapper", () => {
    it("wraps content in a div when withWrapper is true", () => {
      const { container } = render(
        <StatusIndicator value="" waitingLabel="Esperando..." withWrapper />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper.className).toContain("text-xs");
    });

    it("adds flex class when withFlex is true", () => {
      const { container } = render(
        <StatusIndicator value="" waitingLabel="Esperando..." withWrapper withFlex />,
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("flex");
    });
  });
});

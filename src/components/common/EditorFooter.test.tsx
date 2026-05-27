import { describe, it, expect } from "vitest";
import { renderWithI18n } from "../../test/test-utils";
import { EditorFooter } from "./EditorFooter";

const stats = { lines: 5, characters: 120, bytes: 120 };
const validState = { isValid: true, error: null };
const invalidState = { isValid: false, error: { message: "Syntax error" } };

describe("EditorFooter", () => {
  describe("input variant", () => {
    it("renders waiting label when input is empty", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="input"
          value=""
          validationState={validState}
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
          invalidLabel="CSS inválido"
          stats={stats}
        />,
      );

      expect(renderResult.getByText("Esperando CSS...")).toBeInTheDocument();
    });

    it("renders valid label with stats when input is valid", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="input"
          value="body { color: red; }"
          validationState={validState}
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
          invalidLabel="CSS inválido"
          stats={stats}
        />,
      );

      expect(renderResult.getByText(/CSS válido/)).toBeInTheDocument();
      expect(renderResult.getByText(/5 líneas/)).toBeInTheDocument();
      expect(renderResult.getByText(/120 caracteres/)).toBeInTheDocument();
    });

    it("renders error message when input is invalid", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="input"
          value="invalid {"
          validationState={invalidState}
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
          invalidLabel="CSS inválido"
          stats={stats}
        />,
      );

      expect(renderResult.getByText(/Syntax error/)).toBeInTheDocument();
    });

    it("renders warning when provided", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="input"
          value="body {}"
          validationState={validState}
          warning="Input truncated"
          waitingLabel="Esperando CSS..."
          validLabel="CSS válido"
          invalidLabel="CSS inválido"
          stats={stats}
        />,
      );

      expect(renderResult.getByText("Input truncated")).toBeInTheDocument();
    });
  });

  describe("output variant", () => {
    it("renders waiting message when output is empty", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="output"
          value=""
          error={null}
          stats={stats}
          comparisonBytes={100}
          isProcessing={true}
        />,
      );

      expect(renderResult.getByText("Procesando...")).toBeInTheDocument();
    });

    it("renders error message when error is present", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="output"
          value=""
          error="Format failed"
          stats={stats}
          comparisonBytes={100}
        />,
      );

      expect(renderResult.getByText(/Format failed/)).toBeInTheDocument();
    });

    it("renders stats with comparison when output has content", () => {
      const renderResult = renderWithI18n(
        <EditorFooter
          variant="output"
          value="body{color:red}"
          error={null}
          stats={stats}
          comparisonBytes={100}
        />,
      );

      // Usar data-testid para evitar ambigüedad con otros elementos
      const statsElement = renderResult.getByTestId("output-stats");
      expect(statsElement).toHaveTextContent(/5 líneas/);
      expect(statsElement).toHaveTextContent(/120 caracteres/);
      expect(statsElement).toHaveTextContent(/120 bytes/);
      expect(statsElement).toHaveTextContent(/20% más grande/);
    });
  });
});

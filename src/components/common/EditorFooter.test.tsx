import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorFooter } from "./EditorFooter";

const stats = { lines: 5, characters: 120, bytes: 120 };
const validState = { isValid: true, error: null };
const invalidState = { isValid: false, error: { message: "Syntax error" } };

describe("EditorFooter", () => {
  describe("input variant", () => {
    it("renders waiting label when input is empty", () => {
      render(
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

      expect(screen.getByText("Esperando CSS...")).toBeInTheDocument();
    });

    it("renders valid label with stats when input is valid", () => {
      render(
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

      expect(screen.getByText(/CSS válido/)).toBeInTheDocument();
      expect(screen.getByText(/5 líneas/)).toBeInTheDocument();
      expect(screen.getByText(/120 caracteres/)).toBeInTheDocument();
    });

    it("renders error message when input is invalid", () => {
      render(
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

      expect(screen.getByText(/Syntax error/)).toBeInTheDocument();
    });

    it("renders warning when provided", () => {
      render(
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

      expect(screen.getByText("Input truncated")).toBeInTheDocument();
    });
  });

  describe("output variant", () => {
    it("renders waiting message when output is empty", () => {
      render(
        <EditorFooter
          variant="output"
          value=""
          error={null}
          stats={stats}
          comparisonBytes={100}
          isProcessing={true}
        />,
      );

      expect(screen.getByText("Procesando...")).toBeInTheDocument();
    });

    it("renders error message when error is present", () => {
      render(
        <EditorFooter
          variant="output"
          value=""
          error="Format failed"
          stats={stats}
          comparisonBytes={100}
        />,
      );

      expect(screen.getByText(/Format failed/)).toBeInTheDocument();
    });

    it("renders stats with comparison when output has content", () => {
      render(
        <EditorFooter
          variant="output"
          value="body{color:red}"
          error={null}
          stats={stats}
          comparisonBytes={100}
        />,
      );

      expect(screen.getByText(/5 líneas/)).toBeInTheDocument();
      expect(screen.getByText(/120 caracteres/)).toBeInTheDocument();
      expect(screen.getByText(/120 bytes/)).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createFakeLoader, createFakeMonaco, type FakeMonaco } from "@/test/fakeMonaco";
import { DiffCodeEditor } from "./DiffCodeEditor";

let fake: FakeMonaco;
let fakeLoader: ReturnType<typeof createFakeLoader>;

vi.mock("@monaco-editor/react", () => ({
  loader: { init: () => fakeLoader.init() },
}));

describe("DiffCodeEditor", () => {
  beforeEach(() => {
    fake = createFakeMonaco();
    fakeLoader = createFakeLoader(fake.monaco);
  });

  const loadMonaco = async () => {
    await act(async () => fakeLoader.resolve());
  };

  it("passes accessible names for both diff sides to Monaco", async () => {
    render(<DiffCodeEditor original="a" modified="b" language="json" />);
    await loadMonaco();

    const options = fake.diffEditors.at(-1)?.options;
    expect(options?.originalAriaLabel).toBe("Código original (solo lectura)");
    expect(options?.modifiedAriaLabel).toBe("Código resultante (solo lectura)");
  });

  it("re-applies the accessible names on each pane after creation", async () => {
    // Monaco's diff editor recomputes each pane's ariaLabel from the changed options
    // only, so its internal post-create option update wipes the construction labels.
    render(<DiffCodeEditor original="a" modified="b" language="json" />);
    await loadMonaco();

    const editor = fake.diffEditors[0];
    expect(editor.getOriginalEditor().options.ariaLabel).toBe("Código original (solo lectura)");
    expect(editor.getModifiedEditor().options.ariaLabel).toBe("Código resultante (solo lectura)");
  });

  it("closes without disposing models the diff widget still holds", async () => {
    const { unmount } = render(<DiffCodeEditor original="a" modified="b" language="json" />);
    await loadMonaco();
    const [editor] = fake.diffEditors;
    const models = editor.getModel();

    unmount();

    expect(fake.violations).toEqual([]);
    expect(editor.disposed).toBe(true);
    expect(models?.original.disposed).toBe(true);
    expect(models?.modified.disposed).toBe(true);
  });

  it("never creates a diff editor when closed before Monaco finishes loading", async () => {
    const { unmount } = render(<DiffCodeEditor original="a" modified="b" language="json" />);
    unmount();
    await loadMonaco();

    expect(fake.diffEditors).toHaveLength(0);
  });

  it("updates both sides when the compared values change", async () => {
    const { rerender } = render(<DiffCodeEditor original="a" modified="b" language="json" />);
    await loadMonaco();

    rerender(<DiffCodeEditor original="c" modified="d" language="json" />);

    const models = fake.diffEditors[0].getModel();
    expect(models?.original.getValue()).toBe("c");
    expect(models?.modified.getValue()).toBe("d");
  });

  it("shows a localized error with Retry instead of loading forever when Monaco fails to load", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<DiffCodeEditor original="a" modified="b" language="json" />);

    await act(async () => fakeLoader.reject());

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el editor");
    expect(screen.queryByText("Cargando editor...")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});

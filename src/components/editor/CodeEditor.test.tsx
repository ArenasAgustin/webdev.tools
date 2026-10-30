import { StrictMode, Suspense, use } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createFakeLoader, createFakeMonaco, type FakeMonaco } from "@/test/fakeMonaco";
import { CodeEditor } from "./CodeEditor";

let fake: FakeMonaco;
let fakeLoader: ReturnType<typeof createFakeLoader>;

vi.mock("@monaco-editor/react", () => ({
  loader: { init: () => fakeLoader.init() },
}));

// Suspends its Suspense boundary on demand, hiding (and later revealing) the editor
// that is already mounted next to it.
const never = new Promise<never>(() => {});
function Suspender({ suspended }: { suspended: boolean }) {
  if (suspended) use(never);
  return null;
}

function SuspendableEditor({ suspended }: { suspended: boolean }) {
  return (
    <StrictMode>
      <Suspense fallback={null}>
        <Suspender suspended={suspended} />
        <CodeEditor value="a" language="json" />
      </Suspense>
    </StrictMode>
  );
}

describe("CodeEditor", () => {
  beforeEach(() => {
    fake = createFakeMonaco();
    fakeLoader = createFakeLoader(fake.monaco);
  });

  const loadMonaco = async () => {
    await act(async () => fakeLoader.resolve());
  };

  it("passes an accessible name with the Tab focus hint to Monaco", async () => {
    render(<CodeEditor value="" language="json" />);
    await loadMonaco();

    expect(fake.editors.at(-1)?.options.ariaLabel).toBe(
      "Editor de código. Presioná Ctrl+M (Ctrl+Shift+M en macOS) para alternar si Tab indenta o mueve el foco.",
    );
  });

  it("shows the placeholder until Monaco has loaded", async () => {
    render(<CodeEditor value="" language="json" placeholder="Cargando JSON" />);
    expect(screen.getByText("Cargando JSON")).toBeInTheDocument();

    await loadMonaco();

    expect(screen.queryByText("Cargando JSON")).not.toBeInTheDocument();
  });

  it("never creates an editor when unmounted before Monaco finishes loading", async () => {
    const { unmount } = render(<CodeEditor value="a" language="json" />);
    unmount();
    await loadMonaco();

    expect(fake.editors).toHaveLength(0);
    expect(fake.violations).toEqual([]);
  });

  it("survives a StrictMode Suspense hide/reveal without touching a disposed editor", async () => {
    const { rerender } = render(<SuspendableEditor suspended={false} />);
    await loadMonaco();
    await waitFor(() => expect(fake.editors.length).toBeGreaterThan(0));

    act(() => rerender(<SuspendableEditor suspended />));
    await act(async () => rerender(<SuspendableEditor suspended={false} />));

    expect(fake.violations).toEqual([]);
    // The reveal reconnected the effects: the first editor was disposed and replaced.
    expect(fake.editors.length).toBeGreaterThan(1);
    const live = fake.editors.filter((editor) => !editor.disposed);
    expect(live).toHaveLength(1);
    expect(live[0].getValue()).toBe("a");
  });

  it("disposes the editor and then its model on unmount", async () => {
    const { unmount } = render(<CodeEditor value="a" language="json" />);
    await loadMonaco();
    const [editor] = fake.editors;
    const model = editor.getModel();

    unmount();

    expect(editor.disposed).toBe(true);
    expect(model?.disposed).toBe(true);
  });

  it("applies external value changes without reporting them as user edits", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<CodeEditor value="a" language="json" onChange={onChange} />);
    await loadMonaco();

    rerender(<CodeEditor value="b" language="json" onChange={onChange} />);
    expect(fake.editors[0].getValue()).toBe("b");
    expect(onChange).not.toHaveBeenCalled();

    fake.editors[0].setValue("typed");
    expect(onChange).toHaveBeenCalledWith("typed");
  });

  it("shows a localized error with Retry instead of loading forever when Monaco fails to load", async () => {
    const reload = vi.fn();
    vi.stubGlobal("location", { ...window.location, reload });
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CodeEditor value="a" language="json" />);

    await act(async () => fakeLoader.reject());

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo cargar el editor");
    expect(screen.queryByText("Cargando editor...")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reload).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});

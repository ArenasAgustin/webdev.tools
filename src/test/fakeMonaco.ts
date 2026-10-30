/**
 * Minimal in-memory stand-in for the Monaco API used by the editor wrappers.
 *
 * It mirrors the two teardown invariants real Monaco enforces, but records violations
 * instead of relying on Monaco's async error reporting, so tests can assert on them:
 * - a disposed editor can no longer attach a model ("InstantiationService has been disposed");
 * - a model must not be disposed while a live diff editor still holds it.
 */

type Listener<T> = (event: T) => void;

export interface FakeModel {
  value: string;
  language: string;
  disposed: boolean;
  getValue(): string;
  setValue(value: string): void;
  getFullModelRange(): object;
  dispose(): void;
}

export interface FakeEditor {
  disposed: boolean;
  options: Record<string, unknown>;
  getModel(): FakeModel | null;
  setModel(model: FakeModel | null): void;
  getValue(): string;
  setValue(value: string): void;
  executeEdits(source: string, edits: { text: string }[]): void;
  pushUndoStop(): void;
  getOption(option: string): unknown;
  updateOptions(options: Record<string, unknown>): void;
  onDidChangeModelContent(listener: Listener<unknown>): { dispose(): void };
  saveViewState(): null;
  restoreViewState(): void;
  revealLine(): void;
  dispose(): void;
}

export interface FakeDiffEditor {
  disposed: boolean;
  options: Record<string, unknown>;
  getModel(): { original: FakeModel; modified: FakeModel } | null;
  setModel(model: { original: FakeModel; modified: FakeModel } | null): void;
  getOriginalEditor(): FakeEditor;
  getModifiedEditor(): FakeEditor;
  updateOptions(options: Record<string, unknown>): void;
  dispose(): void;
}

export function createFakeMonaco() {
  const violations: string[] = [];
  const editors: FakeEditor[] = [];
  const diffEditors: FakeDiffEditor[] = [];
  const models: FakeModel[] = [];
  const liveDiffModels = new Set<FakeModel>();

  const createModel = (value: string, language = ""): FakeModel => {
    const model: FakeModel = {
      value,
      language,
      disposed: false,
      getValue: () => model.value,
      setValue: (next) => {
        model.value = next;
      },
      getFullModelRange: () => ({}),
      dispose: () => {
        if (liveDiffModels.has(model)) {
          violations.push("TextModel got disposed before DiffEditorWidget model got reset");
        }
        model.disposed = true;
      },
    };
    models.push(model);
    return model;
  };

  const createEditor = (options: Record<string, unknown> = {}): FakeEditor => {
    let model = (options.model as FakeModel | undefined) ?? null;
    const listeners = new Set<Listener<unknown>>();
    const editor: FakeEditor = {
      disposed: false,
      options: { ...options },
      getModel: () => (editor.disposed ? null : model),
      setModel: (next) => {
        if (editor.disposed) {
          violations.push("InstantiationService has been disposed");
          throw new Error("InstantiationService has been disposed");
        }
        model = next;
      },
      getValue: () => model?.getValue() ?? "",
      setValue: (value) => {
        model?.setValue(value);
        listeners.forEach((listener) => listener({}));
      },
      executeEdits: (_source, edits) => {
        model?.setValue(edits[0]?.text ?? "");
        listeners.forEach((listener) => listener({}));
      },
      pushUndoStop: () => {},
      getOption: (option) => editor.options[option],
      updateOptions: (next) => {
        Object.assign(editor.options, next);
      },
      onDidChangeModelContent: (listener) => {
        listeners.add(listener);
        return { dispose: () => listeners.delete(listener) };
      },
      saveViewState: () => null,
      restoreViewState: () => {},
      revealLine: () => {},
      dispose: () => {
        editor.disposed = true;
      },
    };
    return editor;
  };

  const monaco = {
    Uri: { parse: (path: string) => ({ path }) },
    editor: {
      EditorOption: { readOnly: "readOnly" },
      createModel,
      getModel: () => null,
      setModelLanguage: (model: FakeModel, language: string) => {
        model.language = language;
      },
      setTheme: () => {},
      onDidChangeMarkers: () => ({ dispose: () => {} }),
      getModelMarkers: () => [],
      create: (_container: HTMLElement, options: Record<string, unknown> = {}) => {
        const editor = createEditor(options);
        editors.push(editor);
        return editor;
      },
      createDiffEditor: (_container: HTMLElement, options: Record<string, unknown> = {}) => {
        const original = createEditor();
        const modified = createEditor();
        let current: { original: FakeModel; modified: FakeModel } | null = null;
        const release = () => {
          if (current) {
            liveDiffModels.delete(current.original);
            liveDiffModels.delete(current.modified);
          }
        };
        const diff: FakeDiffEditor = {
          disposed: false,
          options: { ...options },
          getModel: () => current,
          setModel: (next) => {
            if (diff.disposed) {
              violations.push("InstantiationService has been disposed");
              throw new Error("InstantiationService has been disposed");
            }
            release();
            current = next;
            if (next) {
              liveDiffModels.add(next.original);
              liveDiffModels.add(next.modified);
            }
            original.setModel(next?.original ?? null);
            modified.setModel(next?.modified ?? null);
          },
          getOriginalEditor: () => original,
          getModifiedEditor: () => modified,
          updateOptions: (next) => {
            Object.assign(diff.options, next);
          },
          dispose: () => {
            release();
            diff.disposed = true;
            original.dispose();
            modified.dispose();
          },
        };
        diffEditors.push(diff);
        return diff;
      },
    },
  };

  return { monaco, violations, editors, diffEditors, models };
}

export type FakeMonaco = ReturnType<typeof createFakeMonaco>;

/**
 * Stand-in for `loader` from @monaco-editor/react: `init()` stays pending until
 * `resolve()` is called, and a cancelled init rejects like the real cancelable promise.
 */
export function createFakeLoader(monaco: unknown) {
  let resolveLoad: () => void = () => {};
  let rejectLoad: (error: unknown) => void = () => {};
  const loaded = new Promise<void>((resolve, reject) => {
    resolveLoad = resolve;
    rejectLoad = reject;
  });
  return {
    resolve: () => resolveLoad(),
    /** Fail the load, like a CDN script that cannot be fetched. */
    reject: (error: unknown = new Error("network")) => rejectLoad(error),
    init: () => {
      let cancelled = false;
      const promise = loaded.then(() => {
        if (cancelled) throw { type: "cancelation" };
        return monaco;
      });
      return Object.assign(promise, {
        cancel: () => {
          cancelled = true;
        },
      });
    },
  };
}

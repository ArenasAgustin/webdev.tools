/**
 * Loading fallback for CodeEditor
 * Shows a skeleton loader while Monaco Editor is being loaded
 */
export function CodeEditorLoader() {
  return (
    <div className="w-full h-full min-w-0 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-400 text-sm">Cargando editor...</div>
      </div>
    </div>
  );
}

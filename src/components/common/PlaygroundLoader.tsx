/**
 * Loading fallback for JsonPlayground
 * Shows a skeleton loader while the playground is being loaded
 */
export function PlaygroundLoader() {
  return (
    <div className="col-start-1 row-start-2 flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2">
          <div className="text-white text-lg font-semibold">Cargando JSON Tools</div>
          <div className="text-gray-400 text-sm">Preparando el playground...</div>
        </div>
      </div>
    </div>
  );
}

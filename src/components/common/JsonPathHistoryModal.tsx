import { Modal } from "./Modal";
import type { JsonPathHistoryItem } from "@/hooks/useJsonPathHistory";

interface JsonPathHistoryModalProps {
  isOpen: boolean;
  history: JsonPathHistoryItem[];
  onClose: () => void;
  onReuse: (expression: string) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onClearAll: () => void | Promise<void>;
}

export function JsonPathHistoryModal({
  isOpen,
  history,
  onClose,
  onReuse,
  onDelete,
  onClearAll,
}: JsonPathHistoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title="Historial de Filtros"
      icon="history"
      iconColor="cyan-400"
      onClose={onClose}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30 text-xs"
          >
            <i className="fas fa-trash-alt mr-1"></i> Borrar Historial
          </button>
        </div>
      }
    >
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 italic py-4 text-xs">
            No hay historial reciente
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
            >
              <button
                type="button"
                onClick={() => onReuse(item.expression)}
                className="flex-1 text-left"
                title="Reutilizar filtro"
              >
                <code className="text-cyan-300 text-xs font-mono block mb-1 break-all">
                  {item.expression}
                </code>
                <div className="text-[10px] text-gray-500 flex items-center gap-2">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <span className="text-gray-600">•</span>
                  <span>×{item.frequency}</span>
                </div>
              </button>
              <div className="flex items-center gap-2 pl-2">
                <button
                  type="button"
                  onClick={() => onReuse(item.expression)}
                  className="text-gray-600 group-hover:text-cyan-400 transition-colors text-xs"
                  title="Reutilizar"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                  title="Borrar"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

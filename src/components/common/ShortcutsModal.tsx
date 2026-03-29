import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

interface ShortcutRowProps {
  keys: string[];
  description: string;
}

function ShortcutRow({ keys, description }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-300 text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <span key={key} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-500 text-xs">+</span>}
            <kbd className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-xs text-white font-mono">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasClean?: boolean;
}

export function ShortcutsModal({ isOpen, onClose, hasClean = false }: ShortcutsModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("shortcuts.title")}
      icon="keyboard"
      iconColor="yellow-400"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Transformar */}
        <section>
          <h4 className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fas fa-tools" aria-hidden="true"></i> {t("shortcuts.transform")}
          </h4>
          <div>
            <ShortcutRow keys={["Ctrl/⌘", "Shift", "F"]} description={t("shortcuts.format")} />
            <ShortcutRow keys={["Ctrl/⌘", "Shift", "M"]} description={t("shortcuts.minify")} />
            {hasClean && (
              <ShortcutRow
                keys={["Ctrl/⌘", "Shift", "L"]}
                description={t("shortcuts.cleanEmpty")}
              />
            )}
          </div>
        </section>

        {/* Resultado */}
        <section>
          <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fas fa-terminal" aria-hidden="true"></i> {t("shortcuts.result")}
          </h4>
          <div>
            <ShortcutRow keys={["Ctrl/⌘", "Shift", "C"]} description={t("shortcuts.copyResult")} />
            <ShortcutRow
              keys={["Ctrl/⌘", "Shift", "Supr"]}
              description={t("shortcuts.clearInput")}
            />
          </div>
        </section>

        {/* Interfaz */}
        <section>
          <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <i className="fas fa-sliders-h" aria-hidden="true"></i> {t("shortcuts.interface")}
          </h4>
          <div>
            <ShortcutRow keys={["Ctrl/⌘", ","]} description={t("shortcuts.openConfig")} />
            <ShortcutRow keys={["Ctrl/⌘", "'"]} description={t("shortcuts.viewShortcuts")} />
            <ShortcutRow
              keys={["Ctrl/⌘", "Shift", "D"]}
              description={t("shortcuts.viewDifferences")}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}

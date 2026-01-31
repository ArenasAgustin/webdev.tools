import { Modal } from "./Modal";

export interface TipItem {
  id: string;
  category: string;
  categoryIcon?: string;
  categoryColor?: string; // color class like "blue-400", "purple-400", etc.
  items: Array<{
    code: string;
    description: string;
  }>;
}

export interface QuickExample {
  code: string;
  label: string;
  description: string;
}

interface TipsModalProps {
  isOpen: boolean;
  title: string;
  icon: string;
  iconColor?: string;
  tips: TipItem[];
  quickExamples?: QuickExample[];
  onClose: () => void;
  onTryExample: (code: string) => void;
}

export function TipsModal({
  isOpen,
  title,
  icon,
  iconColor = "yellow-400",
  tips,
  quickExamples = [],
  onClose,
  onTryExample,
}: TipsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      icon={icon}
      iconColor={iconColor}
      onClose={onClose}
    >
      <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-2">
        {/* Tips by category */}
        {tips.map((tip) => {
          const colorMap: Record<
            string,
            { bg: string; border: string; text: string; code: string }
          > = {
            "blue-400": {
              bg: "rgba(96, 165, 250, 0.1)",
              border: "rgba(96, 165, 250, 0.2)",
              text: "#60a5fa",
              code: "#93c5fd",
            },
            "purple-400": {
              bg: "rgba(192, 132, 250, 0.1)",
              border: "rgba(192, 132, 250, 0.2)",
              text: "#c084fa",
              code: "#d8b4fe",
            },
            "green-400": {
              bg: "rgba(74, 222, 128, 0.1)",
              border: "rgba(74, 222, 128, 0.2)",
              text: "#4ade80",
              code: "#86efac",
            },
            "orange-400": {
              bg: "rgba(251, 146, 60, 0.1)",
              border: "rgba(251, 146, 60, 0.2)",
              text: "#fb923c",
              code: "#fdba74",
            },
            "pink-400": {
              bg: "rgba(244, 114, 182, 0.1)",
              border: "rgba(244, 114, 182, 0.2)",
              text: "#f472b6",
              code: "#f472b6",
            },
          };

          const color =
            colorMap[tip.categoryColor || "blue-400"] || colorMap["blue-400"];

          return (
            <div
              key={tip.id}
              style={{
                backgroundColor: color.bg,
                borderColor: color.border,
              }}
              className="border rounded-lg p-3"
            >
              <h4
                className="font-semibold mb-2 flex items-center gap-2"
                style={{ color: color.text }}
              >
                {tip.categoryIcon && (
                  <i className={`fas fa-${tip.categoryIcon}`}></i>
                )}
                {tip.category}
              </h4>
              <ul className="space-y-1 text-gray-300">
                {tip.items.map((item, idx) => (
                  <li key={idx}>
                    <code
                      className="bg-gray-800 px-1 rounded"
                      style={{ color: color.code }}
                    >
                      {item.code}
                    </code>{" "}
                    - {item.description}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Quick examples */}
        {quickExamples.length > 0 && (
          <div
            style={{
              backgroundColor: "rgba(236, 72, 153, 0.1)",
              borderColor: "rgba(236, 72, 153, 0.2)",
            }}
            className="border rounded-lg p-3"
          >
            <h4
              className="font-semibold mb-2 flex items-center gap-2"
              style={{ color: "#f472b6" }}
            >
              <i className="fas fa-magic"></i> Ejemplos Rápidos
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {quickExamples.map((example) => (
                <button
                  key={example.code}
                  onClick={() => onTryExample(example.code)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 text-left text-xs transition-colors"
                >
                  <code style={{ color: "#f472b6" }}>{example.label}</code>
                  <div className="text-gray-500 mt-1 text-xs">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

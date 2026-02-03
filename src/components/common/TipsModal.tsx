import { Modal } from "./Modal";
import { Card } from "./Card";
import type { IconColorKey } from "@/utils/constants/colors";

export interface TipItem {
  id: string;
  category: string;
  categoryIcon?: string;
  categoryColor?: IconColorKey; // color class like "blue-400", "purple-400", etc.
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
  iconColor?: IconColorKey;
  tips: TipItem[];
  quickExamples?: QuickExample[];
  onClose: () => void;
  onTryExample: (code: string) => void;
}

const TIP_COLOR_MAP: Record<
  string,
  { container: string; text: string; code: string }
> = {
  "blue-400": {
    container: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
    code: "text-blue-300",
  },
  "purple-400": {
    container: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-400",
    code: "text-purple-300",
  },
  "green-400": {
    container: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
    code: "text-green-300",
  },
  "orange-400": {
    container: "bg-orange-500/10 border-orange-500/20",
    text: "text-orange-400",
    code: "text-orange-300",
  },
  "pink-400": {
    container: "bg-pink-500/10 border-pink-500/20",
    text: "text-pink-400",
    code: "text-pink-300",
  },
};

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
          const color =
            TIP_COLOR_MAP[tip.categoryColor || "blue-400"] ||
            TIP_COLOR_MAP["blue-400"];

          return (
            <Card
              key={tip.id}
              title={tip.category}
              icon={tip.categoryIcon}
              className={color.container}
              headerClassName={color.text}
            >
              <ul className="space-y-1 text-gray-300">
                {tip.items.map((item, idx) => (
                  <li key={idx}>
                    <code className={`bg-gray-800 px-1 rounded ${color.code}`}>
                      {item.code}
                    </code>{" "}
                    - {item.description}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}

        {/* Quick examples */}
        {quickExamples.length > 0 && (
          <Card
            title="Ejemplos Rápidos"
            icon="magic"
            className="bg-pink-500/10 border-pink-500/20"
            headerClassName="text-pink-400"
          >
            <div className="grid grid-cols-2 gap-2">
              {quickExamples.map((example) => (
                <button
                  key={example.code}
                  onClick={() => onTryExample(example.code)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded text-gray-300 text-left text-xs transition-colors"
                >
                  <code className="text-pink-400">{example.label}</code>
                  <div className="text-gray-500 mt-1 text-xs">
                    {example.description}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
}

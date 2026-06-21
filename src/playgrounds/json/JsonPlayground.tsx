import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GenericPlayground } from "../GenericPlayground";
import { jsonEngine } from "../engines/json.engine";
import { TipsModal } from "@/components/common/TipsModal";
import { JsonPathHistoryModal } from "@/components/common/JsonPathHistoryModal";
import { Button } from "@/components/common/Button";
import { jsonPathTips, jsonPathQuickExamples } from "./jsonPathTips";
import { useJsonPathHistory } from "@/hooks/useJsonPathHistory";

/**
 * JSON Playground - Uses GenericPlayground with JSONPath features
 */
export function JsonPlayground() {
  const { t } = useTranslation();
  const [jsonPathExpression, setJsonPathExpression] = useState("");
  const [jsonPathModal, setJsonPathModal] = useState<"tips" | "history" | null>(null);
  const jsonPathHistory = useJsonPathHistory();

  const handleShowTips = useCallback(() => setJsonPathModal("tips"), []);
  const handleShowHistory = useCallback(() => setJsonPathModal("history"), []);
  const handleCloseJsonPathModal = useCallback(() => setJsonPathModal(null), []);

  const extraActionsParams = useMemo(
    () => ({
      jsonPathExpression,
      setJsonPathExpression,
      addToHistory: jsonPathHistory.addToHistory,
    }),
    [jsonPathExpression, jsonPathHistory.addToHistory],
  );

  const renderToolbarExtra = useCallback(
    ({ actions }: { actions: { handleApplyJsonPath?: () => void } }) => {
      return (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <i className="fas fa-filter text-cyan-400"></i> {t("json.filterTitle")}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={handleShowHistory}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-cyan-300 transition-colors"
                title={t("json.filterHistory")}
                aria-label={t("json.filterHistory")}
              >
                <i className="fas fa-history" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                onClick={handleShowTips}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-300 hover:text-cyan-300 transition-colors"
                title={t("json.filterTips")}
                aria-label={t("json.filterTips")}
              >
                <i className="fas fa-question-circle" aria-hidden="true"></i>
              </button>
            </div>
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={jsonPathExpression}
              onChange={(e) => setJsonPathExpression(e.target.value)}
              aria-label={t("json.filterExpression")}
              className="flex-1 px-3 py-2 bg-gray-900/50 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-400 text-xs border border-white/10"
              placeholder={t("json.filterPlaceholder")}
            />
            <Button
              variant="cyan"
              size="md"
              onClick={actions.handleApplyJsonPath}
              aria-label={t("json.applyFilter")}
              title={t("json.applyFilter")}
            >
              <i className="fas fa-search" aria-hidden="true"></i>
            </Button>
          </div>
        </div>
      );
    },
    [jsonPathExpression, handleShowHistory, handleShowTips, t],
  );

  const renderModals = useCallback(() => {
    return [
      <TipsModal
        key="tips"
        isOpen={jsonPathModal === "tips"}
        title={t("json.tipsTitle")}
        icon="lightbulb"
        iconColor="yellow-400"
        tips={jsonPathTips}
        quickExamples={jsonPathQuickExamples}
        onClose={handleCloseJsonPathModal}
        onTryExample={(code) => {
          setJsonPathExpression(code);
          setJsonPathModal(null);
        }}
      />,
      <JsonPathHistoryModal
        key="history"
        isOpen={jsonPathModal === "history"}
        history={jsonPathHistory.history}
        onClose={handleCloseJsonPathModal}
        onReuse={(expression) => {
          setJsonPathExpression(expression);
          setJsonPathModal(null);
        }}
        onDelete={jsonPathHistory.removeFromHistory}
        onClearAll={jsonPathHistory.clearHistory}
      />,
    ];
  }, [jsonPathModal, jsonPathHistory, handleCloseJsonPathModal, t]);

  return (
    <GenericPlayground
      engine={jsonEngine}
      extraActionsParams={extraActionsParams}
      renderToolbarExtra={renderToolbarExtra}
      renderModals={renderModals}

    />
  );
}

import { useTranslation } from "react-i18next";

export function PlaygroundLoader({ name }: { name: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-2">
          <div className="text-white text-lg font-semibold">{t("loader.loading", { name })}</div>
          <div className="text-gray-400 text-sm">{t("loader.preparing")}</div>
        </div>
      </div>
    </div>
  );
}

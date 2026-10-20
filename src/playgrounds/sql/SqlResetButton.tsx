import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/Button";

interface SqlResetButtonProps {
  onReset?: () => void;
}

/**
 * Drops every table in the in-memory SQLite database so scripts that create
 * tables (like the example) can run again.
 */
export function SqlResetButton({ onReset }: SqlResetButtonProps) {
  const { t } = useTranslation();
  if (!onReset) return null;

  return (
    <Button
      variant="orange"
      size="sm"
      onClick={onReset}
      aria-label={t("sql.resetDatabase")}
      title={t("sql.resetDatabase")}
    >
      <i className="fas fa-database" aria-hidden="true"></i>
    </Button>
  );
}

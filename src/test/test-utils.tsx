import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import type { i18n } from 'i18next';
import { vi } from "vitest";

// Mock de i18n para tests: devuelve textos en español esperados por los tests
const translations: Record<string, string | ((count: number) => string)> = {
  // Toast
  "close_notification": "Close notification",
  // StatusIndicator / EditorFooter
  "waiting_css": "Esperando CSS...",
  "valid_css": "CSS válido",
  "invalid_css": "CSS inválido",
  "syntax_error": "Syntax error",
  "input_truncated": "Input truncated",
  "waiting_operation": "Esperando operación...",
  "processing": "Procesando...",
  "format_failed": "Format failed",
  "valid_json": "JSON válido",
  "lines": (count: number) => `${count} líneas`,
  // InputActions
  "import_file": "Importar archivo",
  "clear": "Limpiar",
  "example": "Ejemplo",
  "download": "Descargar",
  "expand_editor": "Expandir editor",
  // Checkbox
  "checkbox.label": "Enable feature",
  // Panel
  "panel.title": "CSS Editor",
  "panel.actions.copy": "Copy",
  "panel.footer": "3 líneas",
  // PlaygroundLayout
  "playground_layout.editors": "Editors content",
  "playground_layout.toolbar": "Toolbar content",
  "playground_layout.panel": "Panel content",
  // PlaygroundLoader
  "playground_loader.loading": "Cargando {name} Tools",
  "playground_loader.preparing": "Preparando el playground...",
  // Common
  "common.test_content": "Test content",
  "common.content_only": "Content only",
  "common.action": "action",
  "common.footer": "footer",
  // ErrorBoundary
  "error_boundary.title": "Algo salió mal",
  "error_boundary.message": "Ocurrió un error inesperado. Puedes intentar recargar el playground o volver al inicio.",
  "error_boundary.retry": "Reintentar",
  "error_boundary.home": "Inicio",
  "error_boundary.named_fallback": "Error en {name}",
  // ExpandedEditorModal
  "expanded_editor.title": "Editor Test",
  "expanded_editor.placeholder": "Contenido de Editor Test...",
  // JsonPathHistoryModal
  "json_path_history.clear": "Borrar Historial",
  // PasswordPlayground
  "password_playground.placeholder": "Tu contraseña aparecerá aquí",
  "password_playground.generate": "Generar",
  // TimestampPlayground
  "timestamp_playground.convert": "Convertir",
  "timestamp_playground.now": "Ahora",
  "timestamp_playground.clear": "Limpiar",
  "timestamp_playground.timezone_label": "Zona horaria:",
  "timestamp_playground.placeholder": "Unix timestamp o fecha",
  // OfflineBanner
  "offline_message": "Estás sin conexión. Algunas funciones pueden no estar disponibles.",
  // HtmlPlayground
  "preview_label": "Ver vista previa",
  // ColorsPlayground
  "hex_rgb_hsl_placeholder": "HEX, RGB, HSL",
};

// New i18n keys added by i18n-coverage change
const newI18nKeys: Record<string, string | ((vars?: Record<string, unknown>) => string)> = {
  // Stats
  "stats.smaller": "más pequeño",
  "stats.larger": "más grande",
  "stats.summary": (vars?: Record<string, unknown>) =>
    `${vars?.lines ?? ""} líneas · ${vars?.characters ?? ""} caracteres · ${vars?.bytes ?? ""}`,
  // Toast / notifications
  "notifications": "Notificaciones",
  "close_notification": "Cerrar notificación",
  // Editor
  "editor.outputPlaceholder": "El resultado se mostrará aquí...",
  "editor.closeDiff": "Cerrar",
  "editor.expandedTitle": "Resultado",
  "editor.inputPlaceholder": (vars?: Record<string, unknown>) => `Escribí tu ${vars?.language ?? ""} aquí...`,
  "editor.waitingLabel": (vars?: Record<string, unknown>) => `Esperando ${vars?.language ?? ""}...`,
  "editor.validLabel": (vars?: Record<string, unknown>) => `${vars?.language ?? ""} válido`,
  "editor.invalidLabel": (vars?: Record<string, unknown>) => `${vars?.language ?? ""} inválido`,
  // JSON
  "json.historyTitle": "Historial de Filtros",
  "json.clearHistory": "Borrar Historial",
  "json.noHistory": "No hay historial reciente",
  "json.reuseFilter": "Reutilizar filtro",
  "json.deleteFilter": "Borrar filtro",
  "json.filterTitle": "Filtro JSONPath",
  "json.filterHistory": "Historial de filtros",
  "json.filterTips": "Ver tips de filtros",
  "json.filterExpression": "Expresion JSONPath",
  "json.filterPlaceholder": "Ej: $.users[0].name",
  "json.applyFilter": "Aplicar filtro JSONPath",
  "json.tipsTitle": "Tips para Filtros JSONPath",
  // SQL
  "sql.result": "Resultado",
  "sql.loading": "Cargando motor SQLite...",
  "sql.executionError": "Error de ejecución",
  "sql.sqlError": "Error SQL",
  "sql.truncated": (vars?: Record<string, unknown>) => `Resultado truncado a ${vars?.count ?? 1000} filas`,
  // HTML
  "html.previewLabel": "Vista previa",
  "html.resultLabel": "Resultado",
  "html.domInspection": "Inspección DOM",
  "html.noElements": "Sin elementos para inspeccionar",
  "html.viewPreview": "Ver vista previa",
  "html.viewResult": "Ver resultado",
};

// Mock simplificado de i18n para tests
const timestampPlaygroundTexts: Record<string, string> = {
  "Convertir": "Convertir",
  "Ahora": "Ahora",
  "Limpiar": "Limpiar",
  "Zona horaria:": "Zona horaria:",
  "Unix timestamp o fecha": "Unix timestamp o fecha",
  "Unix timestamp o fecha (ISO 8601, RFC 2822)...": "Unix timestamp o fecha (ISO 8601, RFC 2822)...",
};

export const i18nMock = {
  t: (key: string, vars?: Record<string, unknown>) => {
    if (newI18nKeys[key]) {
      const val = newI18nKeys[key];
      return typeof val === 'function' ? (val as (v?: Record<string, unknown>) => string)(vars) : val;
    }
    if (translations[key]) {
      return typeof translations[key] === 'function' ? (translations[key] as (count: number) => string)(1) : translations[key] as string;
    }
    if (timestampPlaygroundTexts[key]) {
      return timestampPlaygroundTexts[key];
    }
    return key;
  },
  use: vi.fn(),
  init: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  changeLanguage: vi.fn().mockResolvedValue(null),
  getFixedT: vi.fn(() => i18nMock.t),
  language: 'es',
  languages: ['es'],
  isInitialized: true,
  exists: vi.fn(),
  hasLoadedNamespace: vi.fn().mockReturnValue(true),
};

export const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18nMock as unknown as i18n}>
      {component}
    </I18nextProvider>
  );
};

export const cleanupI18n = () => {
  // No-op: limpieza de i18n no es necesaria en tests unitarios
};

// Limpiar timeouts después de cada test para evitar errores de SSR
afterEach(() => {
  vi.clearAllTimers();
});
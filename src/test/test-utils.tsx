import { render } from '@testing-library/react';
import i18n from "i18next";
import { I18nextProvider } from 'react-i18next';

// Mock de i18n para tests: devuelve textos en español esperados por los tests
const i18nMock = {
  ...i18n,
  t: (key: string, options?: { count?: number }) => {
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
      // ColorsPlayground
      "hex_rgb_hsl_placeholder": "HEX, RGB, HSL",
      // HtmlPlayground
      "preview_label": "Ver vista previa",
      // OfflineBanner
      "offline_message": "Estás sin conexión. Algunas funciones pueden no estar disponibles.",
    };
    
    // Manejar pluralización (ej: "lines")
    if (key === "lines" && options?.count !== undefined) {
      return translations[key]!(options.count);
    }
    
    return translations[key] || key;
  },
  // Métodos requeridos por react-i18next
  on: vi.fn(),
  off: vi.fn(),
  changeLanguage: vi.fn().mockResolvedValue(null),
};

export const renderWithI18n = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18nMock}>
      {component}
    </I18nextProvider>
  );
};
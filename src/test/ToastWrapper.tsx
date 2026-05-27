import { I18nextProvider } from 'react-i18next';
import i18n from "i18next";

import { I18nContext } from '@/context/i18n.context';

// Mock de i18n para tests
const i18nMock = {
  t: (key: string) => key === "close_notification" ? "Close notification" : key, // Devuelve "Close notification" para el botón de cerrar
};

export const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  // Mock para deshabilitar animaciones en tests
  const mockStyle = {
    transform: "translate-x-0 !important",
    opacity: "1 !important",
  };

  return (
    <I18nContext.Provider value={{ t: i18nMock.t }}>
      <div style={mockStyle}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};
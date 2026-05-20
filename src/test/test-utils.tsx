import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { render } from "@testing-library/react";

// Configuración centralizada de i18n para tests
const initTestI18n = async (resources: Record<string, object> = {}) => {
  // Limpiar estado previo de i18n de manera segura
  if (i18n.isInitialized) {
    await i18n.changeLanguage("es");
    i18n.services.resourceStore.data = {};
    i18n.store.data = {};
    i18n.isInitialized = false;
  }

  await i18n.use(initReactI18next).init({
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        translation: resources,
      },
    },
  });
};

export const renderWithI18n = async (
  component: React.ReactNode,
  resources: Record<string, object> = {}
) => {
  await initTestI18n(resources);
  return {
    ...render(
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    ),
  };
};

// Limpiar i18n después de cada test
export const cleanupI18n = async () => {
  if (i18n.isInitialized) {
    await i18n.changeLanguage("es");
    i18n.services.resourceStore.data = {};
    i18n.store.data = {};
    i18n.isInitialized = false;
  }
};
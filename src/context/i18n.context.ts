import { createContext, useContext } from 'react';

// Tipo para la función de traducción
type TranslateFunction = (key: string) => string;

// Contexto de i18n
interface I18nContextType {
  t: TranslateFunction;
}

// Crear contexto con valor por defecto
const I18nContext = createContext<I18nContextType>({ t: (key) => key });

// Hook para usar el contexto
export const useI18n = () => {
  return useContext(I18nContext);
};

// Exportar el contexto
export { I18nContext };

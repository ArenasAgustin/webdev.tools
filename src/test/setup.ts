import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Initialize i18next for tests with Spanish locale (pins tests to es)
void i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        // Common
        "common.close": "Cerrar",
        "common.cancel": "Cancelar",
        "common.save": "Guardar",
        "common.reset": "Restablecer",
        "common.copy": "Copiar",
        "common.download": "Descargar",
        "common.clear": "Limpiar",
        "common.format": "Formatear",
        "common.minify": "Minificar",
        "common.expand": "Expandir",
        "common.collapse": "Colapsar",
        "common.loading": "Cargando...",
        "common.processing": "Procesando...",
        "common.waiting": "Esperando operación...",
        "common.example": "Ejemplo",
        "common.open": "Abrir",
        "common.import": "Importar",
        "common.export": "Exportar",

        // Sidebar
        "sidebar.title": "WebDev Tools",
        "sidebar.home": "Inicio",
        "sidebar.playgrounds": "Playgrounds",
        "sidebar.navigation": "Panel de navegación",
        "sidebar.closeSidebar": "Cerrar panel",
        "sidebar.availablePlaygrounds": "Playgrounds disponibles",

        // Actions
        "actions.clearInput": "Limpiar entrada",
        "actions.loadExample": "Cargar ejemplo",
        "actions.importFile": "Importar archivo",
        "actions.downloadInput": "Descargar entrada",
        "actions.useInputAsOutput": "Usar entrada como resultado",
        "actions.expandEditor": "Expandir editor",
        "actions.copyResult": "Copiar resultado",
        "actions.downloadResult": "Descargar resultado",
        "actions.useOutputAsInput": "Usar resultado como entrada",
        "actions.viewDifferences": "Ver diferencias input/output",
        "actions.viewShortcuts": "Ver atajos de teclado",
        "actions.configure": "Configurar herramientas",
        "actions.showTools": "Mostrar herramientas",
        "actions.hideTools": "Ocultar herramientas",

        // Toolbar
        "toolbar.title": "Herramientas",
        "toolbar.shortcuts": "Atajos de teclado (?)",
        "toolbar.differences": "Ver diferencias",
        "toolbar.settings": "Configuración",

        // Modal
        "modal.close": "Cerrar modal",
        "modal.configTitle": "Configuración de Herramientas",

        // Shortcuts
        "shortcuts.title": "Atajos de teclado",
        "shortcuts.transform": "Transformar",
        "shortcuts.result": "Resultado",
        "shortcuts.interface": "Interfaz",
        "shortcuts.format": "Formatear",
        "shortcuts.minify": "Minificar",
        "shortcuts.cleanEmpty": "Limpiar vacíos",
        "shortcuts.copyResult": "Copiar resultado",
        "shortcuts.clearInput": "Limpiar entrada",
        "shortcuts.openConfig": "Abrir configuración",
        "shortcuts.viewShortcuts": "Ver atajos de teclado",
        "shortcuts.viewDifferences": "Ver diferencias",
        "shortcuts.clean": "Limpiar vacíos",

        // Tips
        "tips.quickExamples": "Ejemplos Rápidos",

        // Config
        "config.format": "Formatear",
        "config.minify": "Minificar",
        "config.clean": "Limpiar Valores Vacíos",
        "config.indent": "Espaciado",
        "config.sortKeys": "Ordenar claves alfabéticamente",
        "config.enableSort": "Habilitar ordenamiento",
        "config.autoCopy": "Copiar automáticamente",
        "config.enableAutoCopy": "Habilitar auto-copia",
        "config.minifyOptions": "Opciones de minificación",
        "config.removeComments": "Eliminar comentarios",
        "config.removeSpaces": "Eliminar espacios",
        "config.embeddedFormat": "Formato embebido",
        "config.formatCss": "Formatear CSS en <style>",
        "config.formatJs": "Formatear JS en <script>",
        "config.collapseWhitespace": "Colapsar espacios",
        "config.minifyCss": "Minificar CSS inline",
        "config.minifyJs": "Minificar JS inline",
        "config.removeAllSpaces": "Eliminar todos los espacios",
        "config.valuesToRemove": "Valores a eliminar",
        "config.outputFormat": "Formato de salida",
        "config.null": "null",
        "config.undefined": "undefined",
        "config.emptyString": '"" (vacío)',
        "config.emptyArray": "[] (array vacío)",
        "config.emptyObject": "{} (objeto vacío)",
        "config.autoCopyMinify": "Copiar automáticamente",

        // JSONPath
        "jsonPath.title": "Historial JSONPath",
        "jsonPath.empty": "Sin historial",
        "jsonPath.reuse": "Reutilizar",
        "jsonPath.delete": "Eliminar",
        "jsonPath.clearAll": "Limpiar todo",

        // Editor
        "editor.waiting": "Esperando entrada...",
        "editor.output": "Salida",
        "editor.error": "Error",
        "editor.valid": "Válido",
        "editor.invalid": "Inválido",

        // Language
        "language.select": "Seleccionar idioma",
      },
    },
    en: {
      translation: {
        // Common
        "common.close": "Close",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "common.reset": "Reset",
        "common.copy": "Copy",
        "common.download": "Download",
        "common.clear": "Clear",
        "common.format": "Format",
        "common.minify": "Minify",
        "common.expand": "Expand",
        "common.collapse": "Collapse",
        "common.loading": "Loading...",
        "common.processing": "Processing...",
        "common.waiting": "Waiting for operation...",
        "common.example": "Example",
        "common.open": "Open",
        "common.import": "Import",
        "common.export": "Export",

        // Sidebar
        "sidebar.title": "WebDev Tools",
        "sidebar.home": "Home",
        "sidebar.playgrounds": "Playgrounds",
        "sidebar.navigation": "Navigation panel",
        "sidebar.closeSidebar": "Close panel",
        "sidebar.availablePlaygrounds": "Available playgrounds",

        // Actions
        "actions.clearInput": "Clear input",
        "actions.loadExample": "Load example",
        "actions.importFile": "Import file",
        "actions.downloadInput": "Download input",
        "actions.useInputAsOutput": "Use input as result",
        "actions.expandEditor": "Expand editor",
        "actions.copyResult": "Copy result",
        "actions.downloadResult": "Download result",
        "actions.useOutputAsInput": "Use result as input",
        "actions.viewDifferences": "View input/output differences",
        "actions.viewShortcuts": "View keyboard shortcuts",
        "actions.configure": "Configure tools",
        "actions.showTools": "Show tools",
        "actions.hideTools": "Hide tools",

        // Toolbar
        "toolbar.title": "Tools",
        "toolbar.shortcuts": "Keyboard shortcuts (?)",
        "toolbar.differences": "View differences",
        "toolbar.settings": "Settings",

        // Modal
        "modal.close": "Close modal",
        "modal.configTitle": "Tool Settings",

        // Shortcuts
        "shortcuts.title": "Keyboard shortcuts",
        "shortcuts.transform": "Transform",
        "shortcuts.result": "Result",
        "shortcuts.interface": "Interface",
        "shortcuts.format": "Format",
        "shortcuts.minify": "Minify",
        "shortcuts.cleanEmpty": "Clean empty",
        "shortcuts.copyResult": "Copy result",
        "shortcuts.clearInput": "Clear input",
        "shortcuts.openConfig": "Open settings",
        "shortcuts.viewShortcuts": "View shortcuts",
        "shortcuts.viewDifferences": "View differences",
        "shortcuts.clean": "Clean empty",

        // Tips
        "tips.quickExamples": "Quick Examples",

        // Config
        "config.format": "Format",
        "config.minify": "Minify",
        "config.clean": "Clean Empty Values",
        "config.indent": "Indentation",
        "config.sortKeys": "Sort keys alphabetically",
        "config.enableSort": "Enable sorting",
        "config.autoCopy": "Auto copy",
        "config.enableAutoCopy": "Enable auto-copy",
        "config.minifyOptions": "Minification options",
        "config.removeComments": "Remove comments",
        "config.removeSpaces": "Remove spaces",
        "config.embeddedFormat": "Embedded format",
        "config.formatCss": "Format CSS in <style>",
        "config.formatJs": "Format JS in <script>",
        "config.collapseWhitespace": "Collapse whitespace",
        "config.minifyCss": "Minify inline CSS",
        "config.minifyJs": "Minify inline JS",
        "config.removeAllSpaces": "Remove all spaces",
        "config.valuesToRemove": "Values to remove",
        "config.outputFormat": "Output format",
        "config.null": "null",
        "config.undefined": "undefined",
        "config.emptyString": '"" (empty)',
        "config.emptyArray": "[] (empty array)",
        "config.emptyObject": "{} (empty object)",
        "config.autoCopyMinify": "Auto copy",

        // JSONPath
        "jsonPath.title": "JSONPath History",
        "jsonPath.empty": "No history",
        "jsonPath.reuse": "Reuse",
        "jsonPath.delete": "Delete",
        "jsonPath.clearAll": "Clear all",

        // Editor
        "editor.waiting": "Waiting for input...",
        "editor.output": "Output",
        "editor.error": "Error",
        "editor.valid": "Valid",
        "editor.invalid": "Invalid",

        // Language
        "language.select": "Select language",
      },
    },
  },
  lng: "es", // Pin tests to Spanish to preserve existing assertions
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

import "@testing-library/jest-dom";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { vi, afterEach } from "vitest";

// Catch and ignore unhandled worker errors from tinypool that cause CI failures
// This is a known issue with Vitest under memory pressure
vi.stubGlobal("onunhandledrejection", (event: Event) => {
  const e = event as unknown as { reason?: { message?: string } };
  if (e.reason?.message === "Worker exited unexpectedly") {
    event.preventDefault();
  }
});

// Ignorar errores de workers al cerrar
afterEach(() => {
  // Silenciar errores de cleanup de workers
});

// Initialize i18next for tests with Spanish locale (pins tests to es)
// Guard: with shared module cache (no resetModules), i18n is the same singleton
// across all test files — skip re-init if already initialized
if (!i18n.isInitialized) void i18n.use(initReactI18next).init({
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
        "jsonPath.title": "Historial de Filtros",
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
        "editor.lines": "líneas",
        "editor.characters": "caracteres",
        "editor.bytes": "bytes",
        "editor.input": "Entrada",
        "editor.outputIdle": "Formateá, minificá o ejecutá para ver un resultado",
        "editor.dropFileHere": "Soltar archivo aquí",
        "editor.inputPlaceholder": "Escribí tu {{language}} aquí...",
        "editor.waitingLabel": "Esperando {{language}}...",
        "editor.validLabel": "{{language}} válido",
        "editor.invalidLabel": "{{language}} inválido",
        "editor.outputPlaceholder": "El resultado se mostrará aquí...",
        "editor.closeDiff": "Cerrar",
        "editor.expandedTitle": "Resultado",

        // Notifications / Toast
        "notifications": "Notificaciones",
        "close_notification": "Cerrar notificación",

        // Stats
        "stats.smaller": "más pequeño",
        "stats.larger": "más grande",
        "stats.summary": "{{lines}} líneas · {{characters}} caracteres · {{bytes}}",

        // Home
        "home.tagline": "Herramientas para desarrolladores web",
        "home.headline": "Formatea, valida y transforma tu código al instante.",
        "home.description": "Herramientas optimizadas para JSON, JavaScript, HTML y CSS. Sin instalación, 100% en el navegador.",

        // Error
        "error.title": "Error en {{name}}",
        "error.titleDefault": "Algo salió mal",
        "error.message": "Ocurrió un error inesperado. Podés intentar recargar el playground o volver al inicio.",
        "error.retry": "Reintentar",
        "error.backToHome": "Inicio",

        // Hash
        "hash.inputTypeText": "Texto",
        "hash.inputTypeFile": "Archivo",
        "hash.inputPlaceholder": "Ingresá el texto para generar hashes...",
        "hash.fileDropLabel": "Seleccionar archivo — clic o arrastrar aquí",
        "hash.changeFile": "Cambiar archivo",
        "hash.dropFileHere": "Arrastrá un archivo o hacé clic aquí",
        "hash.uppercase": "Mayúsculas",
        "hash.generate": "Generar",
        "hash.results": "Resultados",
        "hash.copyHash": "Copiar hash {{algorithm}}",
        "hash.copyError": "No se pudo copiar al portapapeles",
        "hash.compareTitle": "Comparar Hash",
        "hash.comparePlaceholder": "Ingresá un hash para comparar...",
        "hash.compareAction": "Comparar",
        "hash.matchSuccess": "El hash coincide",
        "hash.matchFail": "El hash NO coincide",

        // Password
        "password.placeholder": "Tu contraseña aparecerá aquí",
        "password.showPassword": "Mostrar contraseña",
        "password.hidePassword": "Ocultar contraseña",
        "password.generate": "Generar",
        "password.copyPassword": "Copiar contraseña",
        "password.copied": "Contraseña copiada",
        "password.options": "Opciones",
        "password.length": "Longitud:",
        "password.charsetUppercase": "Mayúsculas (A-Z)",
        "password.charsetLowercase": "Minúsculas (a-z)",
        "password.charsetNumbers": "Números (0-9)",
        "password.charsetSymbols": "Símbolos (!@#$%)",
        "password.strength": "Fortaleza:",
        "password.history": "Historial:",
        "password.aria.uppercase": "Incluir letras mayúsculas",
        "password.aria.lowercase": "Incluir letras minúsculas",
        "password.aria.numbers": "Incluir números",
        "password.aria.symbols": "Incluir símbolos",

        // Colors
        "colors.placeholder": "HEX, RGB, HSL, HSV, CMYK...",
        "colors.copy": "Copiar {{format}}",

        // HTML
        "html.previewLabel": "Vista previa",
        "html.resultLabel": "Resultado",
        "html.domInspection": "Inspección DOM",
        "html.noElements": "Sin elementos para inspeccionar",
        "html.viewPreview": "Ver vista previa",
        "html.viewResult": "Ver resultado",

        // SQL
        "sql.result": "Resultado",
        "sql.loading": "Cargando motor SQLite...",
        "sql.executionError": "Error de ejecución",
        "sql.sqlError": "Error SQL",
        "sql.truncated": "Resultado truncado a {{count}} filas",

        // JSON
        "json.filterTitle": "Filtro JSONPath",
        "json.filterHistory": "Historial de filtros",
        "json.filterTips": "Ver tips de filtros",
        "json.filterExpression": "Expresion JSONPath",
        "json.filterPlaceholder": "Ej: $.users[0].name",
        "json.applyFilter": "Aplicar filtro JSONPath",
        "json.tipsTitle": "Tips para Filtros JSONPath",
        "json.noHistory": "No hay historial reciente",
        "json.reuseFilter": "Reutilizar filtro",
        "json.deleteFilter": "Borrar filtro",
        "json.historyTitle": "Historial de Filtros",
        "json.clearHistory": "Borrar Historial",

        // Loader
        "loader.loading": "Cargando {{name}} Tools",
        "loader.preparing": "Preparando el playground...",

        // Card / Page
        "card.playground": "Playground",
        "page.playground": "Playground",
        "page.closeSidebarOverlay": "Cerrar overlay del panel",
        "page.openSidebar": "Abrir panel",

        // Offline / Install
        "offline.message": "Sin conexión — las herramientas siguen funcionando localmente",
        "install.title": "Instalar webdev.tools",
        "install.action": "Instalar",
        "install.dismiss": "Descartar",

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
        "editor.lines": "lines",
        "editor.characters": "characters",
        "editor.bytes": "bytes",
        "editor.input": "Input",
        "editor.outputIdle": "Format, minify, or run to see a result",
        "editor.dropFileHere": "Drop file here",
        "editor.inputPlaceholder": "Write your {{language}} here...",
        "editor.waitingLabel": "Waiting for {{language}}...",
        "editor.validLabel": "{{language}} valid",
        "editor.invalidLabel": "{{language}} invalid",
        "editor.outputPlaceholder": "The result will appear here...",
        "editor.closeDiff": "Close",
        "editor.expandedTitle": "Result",

        // Notifications / Toast
        "notifications": "Notifications",
        "close_notification": "Close notification",

        // Stats
        "stats.smaller": "smaller",
        "stats.larger": "larger",
        "stats.summary": "{{lines}} lines · {{characters}} characters · {{bytes}}",

        // Home
        "home.tagline": "Web developer tools",
        "home.headline": "Format, validate and transform your code instantly.",
        "home.description": "Optimized tools for JSON, JavaScript, HTML and CSS. No installation, 100% in the browser.",

        // Error
        "error.title": "Error in {{name}}",
        "error.titleDefault": "Something went wrong",
        "error.message": "An unexpected error occurred. You can try reloading the playground or return to the home page.",
        "error.retry": "Retry",
        "error.backToHome": "Home",

        // Hash
        "hash.inputTypeText": "Text",
        "hash.inputTypeFile": "File",
        "hash.inputPlaceholder": "Enter text to generate hashes...",
        "hash.fileDropLabel": "Select file — click or drag here",
        "hash.changeFile": "Change file",
        "hash.dropFileHere": "Drag a file or click here",
        "hash.uppercase": "Uppercase",
        "hash.generate": "Generate",
        "hash.results": "Results",
        "hash.copyHash": "Copy hash {{algorithm}}",
        "hash.copyError": "Could not copy to clipboard",
        "hash.compareTitle": "Compare Hash",
        "hash.comparePlaceholder": "Enter a hash to compare...",
        "hash.compareAction": "Compare",
        "hash.matchSuccess": "Hash matches",
        "hash.matchFail": "Hash does NOT match",

        // Password
        "password.placeholder": "Your password will appear here",
        "password.showPassword": "Show password",
        "password.hidePassword": "Hide password",
        "password.generate": "Generate",
        "password.copyPassword": "Copy password",
        "password.copied": "Password copied",
        "password.options": "Options",
        "password.length": "Length:",
        "password.charsetUppercase": "Uppercase (A-Z)",
        "password.charsetLowercase": "Lowercase (a-z)",
        "password.charsetNumbers": "Numbers (0-9)",
        "password.charsetSymbols": "Symbols (!@#$%)",
        "password.strength": "Strength:",
        "password.history": "History:",
        "password.aria.uppercase": "Include uppercase letters",
        "password.aria.lowercase": "Include lowercase letters",
        "password.aria.numbers": "Include numbers",
        "password.aria.symbols": "Include symbols",

        // Colors
        "colors.placeholder": "HEX, RGB, HSL, HSV, CMYK...",
        "colors.copy": "Copy {{format}}",

        // HTML
        "html.previewLabel": "Preview",
        "html.resultLabel": "Result",
        "html.domInspection": "DOM Inspection",
        "html.noElements": "No elements to inspect",
        "html.viewPreview": "View preview",
        "html.viewResult": "View result",

        // SQL
        "sql.result": "Result",
        "sql.loading": "Loading SQLite engine...",
        "sql.executionError": "Execution Error",
        "sql.sqlError": "SQL Error",
        "sql.truncated": "Result truncated to {{count}} rows",

        // JSON
        "json.filterTitle": "JSONPath Filter",
        "json.filterHistory": "Filter history",
        "json.filterTips": "View filter tips",
        "json.filterExpression": "JSONPath expression",
        "json.filterPlaceholder": "E.g.: $.users[0].name",
        "json.applyFilter": "Apply JSONPath filter",
        "json.tipsTitle": "Tips for JSONPath Filters",
        "json.noHistory": "No recent history",
        "json.reuseFilter": "Reuse filter",
        "json.deleteFilter": "Delete filter",
        "json.historyTitle": "Filter History",
        "json.clearHistory": "Clear History",

        // Loader
        "loader.loading": "Loading {{name}} Tools",
        "loader.preparing": "Preparing the playground...",

        // Card / Page
        "card.playground": "Playground",
        "page.playground": "Playground",
        "page.closeSidebarOverlay": "Close sidebar overlay",
        "page.openSidebar": "Open sidebar",

        // Offline / Install
        "offline.message": "No connection — tools continue working locally",
        "install.title": "Install webdev.tools",
        "install.action": "Install",
        "install.dismiss": "Dismiss",

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
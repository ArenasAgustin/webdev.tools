# ROADMAP

## 1 ✅

- Agregar funcionalidad al botón de Ejemplo ✅
- Agregar funcionalidad al botón de Copiar ✅
- Agregar funcionalidad al botón de Limpiar vacios ✅
- Agregar funcionalidad al botón de Agrandar ✅

## 2 ✅

- Corregir estilos ✅

## 3 ✅

- Agregar modal con ejemplos para filtros de JSONPath ✅
- Agregar modal para configurar herramientas ✅
- Persistir preferencias y último JSON en localStorage (y preparar IndexedDB para historial) ✅
- Agregar atajos de teclado básicos (formatear, copiar, limpiar) ✅
- Añadir validación en vivo con contador de líneas/caracteres en el output ✅

## 4 ✅

- Historial de filtros JSONPath con acciones rápidas de reutilizar/borrar ✅

### 4.1 - Refactorizaciones Pendientes

#### 🔴 Alta Prioridad

- [x] **Duplicación de iconColors**: Crear constante compartida en `utils/constants/` para `iconColors` usado en `Panel.tsx` y `ExpandedEditorModal.tsx` ✅
- [x] **Tipos de configuración dispersos**: Centralizar interfaces de configuración (`formatConfig`, `minifyConfig`, `cleanConfig`) en `types/json.ts` ✅
- [x] **Servicios de localStorage**: Crear `services/storage.ts` con funciones genéricas de persistencia (`loadSavedConfig`, `loadLastJson`, etc.) ✅

#### 🟠 Media Prioridad

- [x] **Panel y ExpandedEditorModal similares**: Crear componente base `Container` o refactorizar para reutilizar lógica compartida ✅
- [x] **Validación de estado duplicada**: Crear componente `ValidationStatus` o hook `useValidationMessage` para estados del JSON ✅
- [x] **Manejo de colores inconsistente**: Centralizar paleta de colores (hex vs Tailwind) en archivo de constantes ✅
- [x] **Props excesivas en Toolbar**: Agrupar 21 props en objetos (`toolbarActions`, `toolbarConfig`) ✅

#### 🟡 Baja Prioridad

- [x] **Componente de card para configuraciones/tips**: Crear componente `Card` reutilizable para modales ✅
- [x] **Estado modal unificado**: Usar `type ModalType = 'tips' | 'history' | 'config' | null` en lugar de 3 `useState` separados ✅
- [x] **Handlers inline**: Crear hook `useJsonPlaygroundActions()` para encapsular handlers del playground ✅
- [x] **Abstracción de editor expandido**: Crear hook `useExpandedEditor()` para manejo de estado de expansión ✅
- [x] **Carpeta store/ vacía**: Eliminada - no se necesita Zustand para este proyecto ✅

## 5

- Mejorar layout responsive (stack en mobile/tablet, contenedores `min-w-0`, toolbars adhesivas)
- Lazy load de Monaco y split de bundle por playground
- Tests unitarios para servicios (`parse`, `format`, `minify`, `clean`, `jsonPath`) y hooks clave

## 6

- Generalizar playground
- Agregar boton para descargar JSON resultante como archivo .json

## 7

- Mejoras UX/UI: toolbars flotantes dentro del editor, toasts/snackbar para copiar/errores
- Indicadores de estado en Monaco (loading, error) y placeholders más claros
- Tips inline para JSONPath y microcopys en inputs
- Ajustes mobile/tablet: alturas consistentes, scroll suave y barras adhesivas

## 8

- Rendimiento: debounce en validaciones/operaciones, límite de tamaño de entrada con avisos
- Mover parseo pesado a Web Worker (cuando aplique)
- Memoización de resultados y virtualización en vistas grandes
- Telemetría opcional (opt‑in) para entender uso de herramientas

## 9

- SEO/Accesibilidad: meta tags, OpenGraph/Twitter cards, títulos únicos por vista
- Atributos `lang`/`dir`, roles ARIA, foco visible y traps en modales
- Verificación de contraste y navegación por teclado completa
- i18n básico (ES/EN) para mejorar alcance

## 10

- Calidad de código: ESLint type‑checked + reglas React, Prettier y husky
- Tests unitarios y de integración con Vitest para servicios y hooks
- Storybook rápido para `Panel`, `Button`, `CodeEditor` y modales
- Documentación de componentes y guía de contribución

## 11

- Funcionalidades avanzadas: validación con JSON Schema
- Historial robusto con IndexedDB (buscar, etiquetar, borrar)

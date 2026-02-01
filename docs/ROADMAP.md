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

## 5

- Mejorar Expanded Editor Modal, tendria que estar en layout y no en editor
- Fullscreen real por editor (mobile y desktop) con barra de acciones mínima
- Mejorar layout responsive (stack en mobile/tablet, contenedores `min-w-0`, toolbars adhesivas)
- Lazy load de Monaco y split de bundle por playground
- Añadir theme claro/oscuro con toggle y chequeo de contraste accesible
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

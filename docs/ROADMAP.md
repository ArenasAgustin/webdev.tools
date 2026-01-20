# 🧭 Roadmap – JSON Tools → React + Vite + TypeScript

Este documento describe el plan para migrar el prototipo HTML actual a una aplicación
moderna basada en **React + Vite + TypeScript**, usando **Monaco Editor**, **JSON nativo**
y **JSONPath**, con una arquitectura escalable para futuros playgrounds.

---

## 🎯 Objetivos del proyecto

- Editor JSON profesional en el navegador
- Formatear, minificar, validar y filtrar JSON
- 100% client-side
- Arquitectura escalable (JSON → JS, HTML, CSS, PHP)
- Código limpio, tipado y mantenible

---

## ✅ Fase 0 – Base y referencia

**Estado actual**

- Prototipo HTML funcional
- UI y UX definidas
- Todas las features claras

**Objetivo**

- Usar el HTML como *spec visual*
- No agregar nuevas features

---

## ✅ Fase 1 – Bootstrap del proyecto

### Tareas

- ✅ Crear proyecto con Vite + React + TypeScript
- ✅ Configurar Tailwind CSS
- ✅ Configurar estructura base de carpetas

### Resultado

- ✅ App levanta en local
- ✅ Tailwind funcionando
- ✅ Sin lógica todavía

---

## ✅ Fase 2 – Layout en React

### Tareas

- ✅ Pasar el HTML a JSX
- ✅ Crear componentes visuales:
  - ✅ Header
  - ✅ Panel de entrada
  - ✅ Panel de salida
  - ✅ Toolbar
  - ✅ JSONPath input

### Reglas

- ❌ Sin lógica
- ❌ Sin JSON.parse
- ✅ Solo props y layout

---

## ✅ Fase 3 – Integración de Monaco Editor

### Tareas

- ✅ Reemplazar `<textarea>` por Monaco Editor
- ✅ Crear componente `CodeEditor`
- ✅ Manejar estado de input JSON

### Resultado

- ✅ Editor JSON con syntax highlight
- ✅ Estado controlado desde React

---

## ✅ Fase 4 – Validación de JSON

### Tareas

- ✅ Parsear JSON con `JSON.parse`
- ✅ Manejar estado:
  - ✅ JSON válido
  - ✅ Error de parseo
- ✅ Mostrar feedback visual

### Resultado

- ✅ Validación en tiempo real
- ✅ UX clara de error / ok

---

## ✅ Fase 5 – Formatear y Minificar

### Tareas

- ✅ Implementar servicios:
  - ✅ `formatJson`
  - ✅ `minifyJson`
- ✅ Conectar botones de toolbar
- ✅ Mostrar resultado en editor readonly

### Reglas

- ✅ El input nunca se modifica
- ✅ El output siempre es derivado

---

## ✅ Fase 6 – Editor de Resultado

### Tareas

- ✅ Segundo Monaco Editor en modo readonly
- ✅ Mostrar output JSON
- ⚠️ Acciones: copiar, limpiar (botones sin implementar)

### Nota

El editor de resultado ya está implementado desde la Fase 3.
Los botones de copiar y limpiar existen pero no tienen funcionalidad aún.

---

## ✅ Fase 7 – JSONPath (filtros)

### Tareas

- ✅ Input para expresión JSONPath
- ✅ Integrar `jsonpath-plus`
- ✅ Mostrar resultado del filtro
- ✅ Manejo de errores de expresión

---

## ✅ Fase 8 – Manejo de errores y UX

### Tareas

- ✅ Centralizar errores usando Result type
- ✅ Mensajes claros:
  - ✅ JSON inválido
  - ✅ Filtro inválido
  - ✅ Resultado vacío
  - ✅ Operaciones sin input
- ✅ Estados vacíos con feedback apropiado

### Resultado

Todos los handlers validan entrada y muestran mensajes claros.
Los errores se muestran en el footer del panel de resultado.
Estados vacíos tienen placeholders descriptivos.

---

## ✅ Fase 9 – Refactor de arquitectura

### Tareas

- ✅ Extraer lógica a `services/` (completado)
- ✅ Crear hooks:
  - ✅ `useJsonParser`
  - ✅ `useJsonFormatter`
  - ✅ `useJsonPath`
- ✅ Limpiar componentes UI (completado)

### Objetivo

- ✅ Separar UI de lógica (completado)
- ✅ Facilitar testing y escalabilidad (completado)

### Resultado

La arquitectura está completamente refactorizada:
- Servicios puros en `services/json/` sin dependencias de React
- Hooks personalizados en `hooks/` que encapsulan lógica de estado
- Componente `App.tsx` limpio y enfocado solo en UI
- Código altamente testeable y reutilizable

---

## ✅ Fase 10 – Preparar escalabilidad

### Tareas

- ✅ Crear carpeta `playgrounds/json` (estructura existe)
- ✅ Encapsular todo el JSON Playground
- ✅ Definir interfaz base para playgrounds

### Resultado

- ✅ Base lista para:
  - JS Playground
  - HTML/CSS tools
  - PHP sandbox

### Estado

Todo el código JSON está ahora encapsulado en `playgrounds/json/`:
- `JsonPlayground.tsx` - Componente principal del playground
- `JsonEditors.tsx` - Paneles de entrada/salida
- `json.config.ts` - Configuración del playground
- `json.types.ts` - Tipos específicos del JSON playground
- `index.ts` - Exportaciones públicas

Se definió la interfaz base `Playground` en `types/playground.ts` que permite
agregar nuevos playgrounds siguiendo el mismo patrón.

App.tsx ahora solo renderiza el Header y delega todo a JsonPlayground.

---

## 🟢 Fase 11 – Persistencia client-side (opcional)

### Tareas

- Guardar último JSON
- Guardar último JSONPath
- Historial de filtros

### Tecnologías

- `localStorage`
- `IndexedDB` (si crece)

---

## 🚀 Futuro (fuera de scope inicial)

- JSON Schema validation
- Diff entre JSON
- Export / share por URL
- jq (WebAssembly)
- Modo offline / PWA

---

## 🧠 Regla de oro

> La lógica de negocio **no depende de React**  
> React solo renderiza y conecta

---

## ✅ Estado del roadmap

- [x] Fase 1 – Bootstrap ✅ COMPLETO
- [x] Fase 2 – Layout ✅ COMPLETO
- [x] Fase 3 – Monaco ✅ COMPLETO
- [x] Fase 4 – Validación ✅ COMPLETO
- [x] Fase 5 – Formatear / Minificar ✅ COMPLETO
- [x] Fase 6 – Output Editor ✅ COMPLETO
- [x] Fase 7 – JSONPath ✅ COMPLETO
- [~] Fase 8 – UX & errores ⚠️ PARCIAL
- [~] Fase 9 – Refactor ⚠️ PARCIAL
- [~] Fase 10 – Escalabilidad ⚠️ PARCIAL
- [ ] Fase 11 – Persistencia ❌ PENDIENTE

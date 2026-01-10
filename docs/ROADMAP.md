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

## 🟢 Fase 0 – Base y referencia

**Estado actual**

- Prototipo HTML funcional
- UI y UX definidas
- Todas las features claras

**Objetivo**

- Usar el HTML como *spec visual*
- No agregar nuevas features

---

## 🟢 Fase 1 – Bootstrap del proyecto

### Tareas

- Crear proyecto con Vite + React + TypeScript
- Configurar Tailwind CSS
- Configurar estructura base de carpetas

### Resultado

- App levanta en local
- Tailwind funcionando
- Sin lógica todavía

---

## 🟢 Fase 2 – Layout en React

### Tareas

- Pasar el HTML a JSX
- Crear componentes visuales:
  - Header
  - Panel de entrada
  - Panel de salida
  - Toolbar
  - JSONPath input

### Reglas

- ❌ Sin lógica
- ❌ Sin JSON.parse
- ✅ Solo props y layout

---

## 🟢 Fase 3 – Integración de Monaco Editor

### Tareas

- Reemplazar `<textarea>` por Monaco Editor
- Crear componente `CodeEditor`
- Manejar estado de input JSON

### Resultado

- Editor JSON con syntax highlight
- Estado controlado desde React

---

## 🟢 Fase 4 – Validación de JSON

### Tareas

- Parsear JSON con `JSON.parse`
- Manejar estado:
  - JSON válido
  - Error de parseo
- Mostrar feedback visual

### Resultado

- Validación en tiempo real
- UX clara de error / ok

---

## 🟢 Fase 5 – Formatear y Minificar

### Tareas

- Implementar servicios:
  - `formatJson`
  - `minifyJson`
- Conectar botones de toolbar
- Mostrar resultado en editor readonly

### Reglas

- El input nunca se modifica
- El output siempre es derivado

---

## 🟢 Fase 6 – Editor de Resultado

### Tareas

- Segundo Monaco Editor en modo readonly
- Mostrar output JSON
- Acciones: copiar, limpiar

---

## 🟢 Fase 7 – JSONPath (filtros)

### Tareas

- Input para expresión JSONPath
- Integrar `jsonpath-plus`
- Mostrar resultado del filtro
- Manejo de errores de expresión

---

## 🟢 Fase 8 – Manejo de errores y UX

### Tareas

- Centralizar errores
- Mensajes claros:
  - JSON inválido
  - Filtro inválido
  - Resultado vacío
- Estados vacíos (empty states)

---

## 🟢 Fase 9 – Refactor de arquitectura

### Tareas

- Extraer lógica a `services/`
- Crear hooks:
  - `useJsonParser`
  - `useJsonFormatter`
  - `useJsonPath`
- Limpiar componentes UI

### Objetivo

- Separar UI de lógica
- Facilitar testing y escalabilidad

---

## 🟢 Fase 10 – Preparar escalabilidad

### Tareas

- Crear carpeta `playgrounds/json`
- Encapsular todo el JSON Playground
- Definir interfaz base para playgrounds

### Resultado

- Base lista para:
  - JS Playground
  - HTML/CSS tools
  - PHP sandbox

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

- [ ] Fase 1 – Bootstrap
- [ ] Fase 2 – Layout
- [ ] Fase 3 – Monaco
- [ ] Fase 4 – Validación
- [ ] Fase 5 – Formatear / Minificar
- [ ] Fase 6 – Output Editor
- [ ] Fase 7 – JSONPath
- [ ] Fase 8 – UX & errores
- [ ] Fase 9 – Refactor
- [ ] Fase 10 – Escalabilidad
- [ ] Fase 11 – Persistencia

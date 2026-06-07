# ROADMAP

## Completado

- [x] Limpiar vacíos — JS (variables/funciones/objetos vacíos), HTML (etiquetas vacías), CSS (reglas vacías)
- [x] Color Transform (Color Picker con conversión HEX, RGB, HSL, HSV, CMYK)
- [x] Hash Generator
- [x] Random Password Generator
- [x] Unix Timestamp Transform
- [x] DESIGN.md con el diseño del proyecto
- [x] **PHP Playground (parcial)** — format, validate, parse, highlight errors, tests unitarios
  - Stack: `php-parser` (AST/validate) + formatter heurístico propio (reemplazó `prettier-plugin-php`)
  - Servicios en `services/php/transform.ts`, adapter `usePhpPlaygroundActions`, página `PhpPlayground.tsx`

---

## New Playground Implementations

- [ ] **SQL Playground** (5-7 días)
  - [ ] **Stack/Plugins:** `sql-formatter` (format), `node-sql-parser` (validate/AST), `sql.js` (execution in-browser)
  - [ ] Integrar SQL formatter/parser (sql-formatter)
  - [ ] Implement: `services/sql/parse.ts`, `format.ts`, `validate.ts`
  - [ ] Query execution (SQLite in-browser con sql.js)
  - [ ] Crear `useSqlPlaygroundActions` adapter
  - [ ] Crear página: `src/playgrounds/sql/SqlPlayground.tsx`
  - [ ] Tab para results/schema visualization
  - [ ] Tests unitarios (services + hooks)
  - [ ] Tests de integración (playground + toolbar/config)

- [ ] **PHP Playground (completar)**
  - [ ] Mejorar formatter (actualmente heurístico con limitaciones en heredocs/strings complejos)
  - [ ] Ejecución de código PHP client-side via `@php-wasm/web` (~15MB WASM, lazy load)
  - [ ] Output capture (stdout/stderr) — resuelto por php-wasm automáticamente

---

## Nuevas features por implementar

- [ ] Transformación de JSON a TOML, CSV, XML, YAML
- [ ] Convertidor de unidades de CSS
- [ ] Generador de QR codes
- [ ] Playground de Markdown con preview
- [ ] Regex tester con visualización de grupos
- [ ] Playground Typescript
- [ ] Playground de SASS/SCSS/LESS
- [ ] Arreglar error para abrir/cerrar toolbar (no funciona si abris desde el medio y cerras con boton)
- [ ] Hacer que si el palyground no tiene configs para modal no se coloque el boton
- [ ] Agregar modal configs para php y sql
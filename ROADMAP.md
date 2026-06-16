# ROADMAP — webdev.tools

PWA de herramientas para desarrolladores web. React 19 + Vite 6 + TypeScript 5.9.

---

## Completado

### Core

- [x] Arquitectura PlaygroundEngine — interfaz unificada para todos los playgrounds
- [x] GenericPlayground shell — componente único que consume cualquier engine
- [x] Worker offloading — inputs ≥ 100KB van a Web Worker, menores corren sync en main thread
- [x] PWA + Workbox — cacheo offline, autoUpdate
- [x] i18n — español (default) e inglés con i18next
- [x] Monaco Editor — lazy loaded, chunk separado
- [x] React Router DOM 7 — routing por playground
- [x] Storybook 10 — con addon-vitest y addon-a11y
- [x] Testing matrix estricta — verify-architecture.js valida 12 archivos requeridos por playground
- [x] Coverage threshold — lines 88%, functions 79%, branches 86%
- [x] CI hardening + E2E gap fill for colors/hash/password/timestamp playgrounds
- [X] Arreglar error para abrir/cerrar toolbar (no funciona si abris desde el medio y cerras con boton)
- [x] Migración de linting a `@eslint-react/eslint-plugin` + ESLint 10 — reglas type-aware para React 19 (reemplaza `eslint-plugin-react`); cascada typescript-eslint 8.61 y react-hooks 7.1

### Playgrounds

- [x] JSON — format, minify, JSONPath history (IndexedDB), diff
- [x] JavaScript — format, minify, transform
- [x] HTML — format, minify, clean
- [x] CSS — format, minify, validate (css-tree)
- [x] PHP — format, validate, parse, highlight errors, execute (client-side via `@php-wasm/web`, lazy load ~15MB)
  - Stack: `php-parser` (AST/validate) + formatter heurístico propio + `@php-wasm/web` para ejecución
  - Servicios en `services/php/transform.ts`, `services/php/phpExecutor.ts`, adapter `usePhpPlaygroundActions`, página `PhpPlayground.tsx`
- [x] SQL — format, validate, minify, execute (SQLite WASM via sql.js)
- [x] Colors — conversión entre formatos de color
- [x] Hash — generación de hashes
- [x] Password — generador de contraseñas
- [x] Timestamp — conversión de timestamps
- [x] Limpiar vacíos — JS / HTML / CSS
- [x] DESIGN.md con el diseño del proyecto
- [x] Config modal para PHP y SQL (indentSize, tabWidth, autoCopy)
- [x] Ocultar botón config cuando el playground no tiene modal (`hasConfigModal` en engine)

---

## En progreso

_(vacío)_

---

## Próximo

- [ ] Base64 encoder/decoder
- [ ] URL encoder/decoder
- [ ] JWT decoder
- [ ] TypeScript playground
- [ ] SASS/SCSS/LESS playground
- [ ] Transformación de JSON a TOML, CSV, XML, YAML
- [ ] Convertidor de unidades de CSS
- [ ] Generador de QR codes
- [ ] Playground de Markdown con preview
- [ ] Regex tester con visualización de grupos
- [ ] Visor de SQL (ANALIZAR ANTES)
- [ ] Share URL — compartir playground con contenido pre-cargado via query params (`?input=...`) para facilitar colaboración (ANALIZAR ANTES: tamaño máximo de URL, encoding, compresión)

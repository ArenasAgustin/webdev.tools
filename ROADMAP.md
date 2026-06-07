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

### Playgrounds

- [x] JSON — format, minify, JSONPath history (IndexedDB), diff
- [x] JavaScript — format, minify, transform
- [x] HTML — format, minify, clean
- [x] CSS — format, minify, validate (css-tree)
- [x] PHP — format, validate, parse, highlight errors
  - Stack: `php-parser` (AST/validate) + formatter heurístico propio
  - Servicios en `services/php/transform.ts`, adapter `usePhpPlaygroundActions`, página `PhpPlayground.tsx`
- [x] SQL — format, validate, minify, execute (SQLite WASM via sql.js)
- [x] Colors — conversión entre formatos de color
- [x] Hash — generación de hashes
- [x] Password — generador de contraseñas
- [x] Timestamp — conversión de timestamps
- [x] Limpiar vacíos — JS / HTML / CSS
- [x] DESIGN.md con el diseño del proyecto

---

## En progreso

- [ ] **PHP — ejecución client-side** via `@php-wasm/web` (~15MB WASM, lazy load)
  - Output capture (stdout/stderr) resuelto por php-wasm automáticamente
  - Mejorar formatter (limitaciones actuales en heredocs/strings complejos)

---

## Próximo

- [ ] Base64 encoder/decoder
- [ ] URL encoder/decoder
- [ ] JWT decoder
- [ ] Regex tester con visualización de grupos
- [ ] Markdown playground con preview
- [ ] TypeScript playground
- [ ] SASS/SCSS/LESS playground
- [ ] Compartir snippets por URL (estado serializado en query params)
- [ ] Transformación de JSON a TOML, CSV, XML, YAML
- [ ] Convertidor de unidades de CSS
- [ ] Generador de QR codes
- [ ] Temas claro/oscuro
- [ ] Keyboard shortcuts globales configurables por usuario

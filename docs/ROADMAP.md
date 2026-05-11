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

### Playgrounds

- [x] JSON — format, minify, JSONPath history (IndexedDB), diff
- [x] JavaScript — format, minify, transform
- [x] HTML — format, minify, clean
- [x] CSS — format, minify, validate (css-tree)
- [x] PHP — format, minify
- [x] Colors — conversión entre formatos de color
- [x] Hash — generación de hashes
- [x] Password — generador de contraseñas
- [x] Timestamp — conversión de timestamps

---

## En progreso

_(vacío)_

---

## Próximo

- [ ] Más playgrounds (Base64, URL encoder/decoder, Regex tester, JWT decoder)
- [ ] Compartir snippets por URL (estado serializado en query params)
- [ ] Temas claro/oscuro
- [ ] Keyboard shortcuts globales configurables por usuario

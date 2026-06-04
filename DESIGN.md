```yaml
brand:
  name: webdev.tools
  personality: Dark, glassmorphic, developer-focused — transparencias sobre negro, acentos neón suaves

colors:
  background: "#020617"        # slate-950, definido en index.html inline style
  surface: "rgba(255,255,255,0.05)"   # bg-white/5, paneles y cards
  surface_elevated: "rgba(255,255,255,0.10)"  # bg-white/10, modales y sidebars
  text_primary: "#ffffff"
  text_secondary: "#9ca3af"    # gray-400
  text_muted: "#6b7280"        # gray-500 # inferido
  accent: "#22d3ee"            # cyan-400, color dominante de foco e interacción
  accent_blue: "#60a5fa"       # blue-400, botones primarios y tabs activas
  border: "rgba(255,255,255,0.10)"    # white/10, borde más común
  border_subtle: "rgba(255,255,255,0.05)"  # white/5, separadores suaves
  error: "#f87171"             # red-400
  success: "#4ade80"           # green-400
  warning: "#facc15"           # yellow-400
  overlay: "rgba(0,0,0,0.70)" # bg-black/70, fondo de modales
  theme_meta: "#0f172a"        # slate-900, color de barra del navegador

typography:
  heading:
    font: "'Space Grotesk', 'Segoe UI', sans-serif"
    size: "clamp(1.5rem, 5vw, 3rem)"   # text-4xl sm:text-5xl en homepage # inferido
    weight: "600"
    line_height: "1.2"         # inferido de tight heading pattern
  subheading:
    font: "'Space Grotesk', 'Segoe UI', sans-serif"
    size: "1.25rem"            # text-xl
    weight: "600"
    line_height: "1.4"
  body:
    font: "'Space Grotesk', 'Segoe UI', sans-serif"
    size: "0.875rem"           # text-sm, dominante en componentes
    weight: "400"
    line_height: "1.5"
  caption:
    font: "'Space Grotesk', 'Segoe UI', sans-serif"
    size: "0.75rem"            # text-xs
  label_uppercase:
    font: "'Space Grotesk', 'Segoe UI', sans-serif"
    size: "0.75rem"
    weight: "500"
    letter_spacing: "0.2em"    # tracking-[0.2em] a tracking-[0.25em]
  code:
    font: "ui-monospace, SFMono-Regular, Menlo, monospace"   # font-mono de Tailwind
    size: "0.875rem"

spacing:
  base_unit: "4px"             # base de Tailwind (rem-4 = 16px, /4 = 4px)
  padding_card: "1rem"         # p-4 en cards estándar; p-6 en PlaygroundCard
  gap_section: "1.5rem"        # gap-6 entre secciones de grilla
  gap_inline: "0.5rem"         # gap-2, separación entre ícono y texto
  border_radius_default: "8px"  # rounded-lg
  border_radius_card: "12px"   # rounded-xl
  border_radius_modal: "16px"  # rounded-2xl
  border_radius_full: "9999px" # rounded-full, avatares e indicadores
  icon_size_sm: "2rem"         # w-8 h-8
  icon_size_md: "2.25rem"      # w-9 h-9
  icon_size_lg: "3rem"         # w-12 h-12

breakpoints:
  mobile: "640px"   # sm — primer punto de quiebre dominante
  tablet: "768px"   # md
  desktop: "1024px" # lg
```

---

## Brand

webdev.tools es una herramienta para desarrolladores web. El tono visual es **oscuro, preciso y moderno**: combina un fondo casi negro (`#020617`) con capas semitransparentes que crean profundidad sin ruido.

**Principios:**

- **Glassmorfismo controlado** — las superficies son `bg-white/5` y `bg-white/10` con `backdrop-blur`, no colores sólidos. Transmite ligereza sin perder legibilidad.
- **Acentos neón suaves** — cyan (`#22d3ee`) para foco e interacción primaria; azul (`#60a5fa`) para acciones y estados activos. Nunca colores saturados al 100%.
- **Jerarquía por opacidad** — no por tamaño de fuente. Un borde `white/10` vs `white/5` comunica más o menos énfasis.
- **Micro-interacciones** — `hover:-translate-y-1`, `transition-all`, blurs decorativos con gradientes. El movimiento es sutil, nunca frenético.

---

## Colors

| Token | Hex / Valor | Uso |
|-------|-------------|-----|
| `background` | `#020617` | Fondo base de toda la app |
| `surface` | `rgba(255,255,255,0.05)` | Cards, PlaygroundCard, paneles neutros |
| `surface_elevated` | `rgba(255,255,255,0.10)` | Modales, sidebar, header de modal |
| `text_primary` | `#ffffff` | Títulos, labels activos, íconos activos |
| `text_secondary` | `#9ca3af` | Body copy, labels de form, subtítulos |
| `accent` | `#22d3ee` | Focus rings, bordes activos, highlights |
| `accent_blue` | `#60a5fa` | Tab activa, botón primary, border focus global |
| `border` | `rgba(255,255,255,0.10)` | Borde estándar de todos los contenedores |
| `border_subtle` | `rgba(255,255,255,0.05)` | Separadores internos, delineado mínimo |
| `error` | `#f87171` | Botones danger, mensajes de error, toast error |
| `success` | `#4ade80` | Confirmaciones, toast success |
| `warning` | `#facc15` | Advertencias, toolbar highlight |
| `overlay` | `rgba(0,0,0,0.70)` | Fondo de modales con `backdrop-blur-sm` |

**Paleta de variantes de botones** (patrón consistente `color-500/20` → texto `color-300`):

| Variante | Fondo | Texto | Borde |
|----------|-------|-------|-------|
| primary | `blue-500/20` | `blue-300` | `blue-500/30` |
| danger | `red-500/20` | `red-300` | `red-500/30` |
| success | `green-500/20` | `green-300` | `green-500/30` |
| purple | `purple-500/20` | `purple-300` | `purple-500/30` |
| cyan | `cyan-500/20` | `cyan-300` | `cyan-500/30` |
| orange | `orange-500/20` | `orange-300` | `orange-500/30` |

---

## Typography

**Fuente única**: `Space Grotesk` (Google Fonts, pesos 400/500/600/700). Fallback: `'Segoe UI', sans-serif`. Código: `font-mono` de Tailwind.

### Jerarquía

| Nivel | Clase Tailwind | Peso | Uso |
|-------|---------------|------|-----|
| H1 | `text-4xl sm:text-5xl` | `font-semibold` | Título de página (homepage hero) |
| H2 | `text-xl` | `font-semibold` | Título de sección, PlaygroundCard |
| H3 | `text-lg` | `font-semibold` | Título de panel, modal header |
| H4 | `text-base` | `font-semibold` | Título de card compacta |
| Body | `text-sm` | `font-normal` | Contenido estándar, etiquetas |
| Caption | `text-xs` | `font-normal` | Metadata, timestamps, hints |
| Label uppercase | `text-xs uppercase tracking-[0.2em]` | `font-medium` | Etiquetas de sección, categorías |
| Code | `font-mono text-sm` | — | Valores técnicos, snippets, inputs de código |

**Reglas:**
- Usar `text-sm` como tamaño base de UI, no `text-base`. `text-base` es para párrafos narrativos.
- `uppercase + tracking-[0.2em]` solo para labels de categoría o encabezados de sección — nunca en body copy.
- Evitar más de 3 niveles de jerarquía dentro de un mismo componente.

---

## Spacing

El sistema se basa en la escala de Tailwind (unidad base: 4px). Los valores más usados:

| Uso | Clase | Valor |
|-----|-------|-------|
| Gap inline (ícono + texto) | `gap-2` | 8px |
| Gap entre campos de form | `gap-3` | 12px |
| Gap entre cards | `gap-4` | 16px |
| Gap de sección | `gap-6` | 24px |
| Padding de card compacta | `p-3 sm:p-4` | 12–16px |
| Padding de card estándar | `p-4` | 16px |
| Padding de PlaygroundCard | `p-6` | 24px |
| Padding de botón sm | `px-2 py-1` | — |
| Padding de botón md | `px-3 py-2` | — |
| Padding de input | `px-3 py-2` | — |

**Lógica**: los espaciados siguen una progresión geométrica ×1.5 (2→3→4→6→8). No usar valores fuera de la escala salvo `py-2.5` (10px) que aparece en inputs especiales.

**Border radius**: de menor a mayor — `rounded` (4px) para botones/inputs → `rounded-lg` (8px) para cards → `rounded-xl` (12px) para panels → `rounded-2xl` (16px) para modales.

---

## Components

### Button

```
base:     rounded transition-all border text-xs/sm font-medium
sm:       px-2 py-1 text-xs
md:       px-3 py-2 text-sm
disabled: opacity-50 cursor-not-allowed
```

Variantes: primary / danger / success / purple / cyan / orange (ver tabla en Colors). Siempre llevan borde del mismo color a `/30` de opacidad. Hover sube de `/20` a `/30` en el fondo.

### Card / PlaygroundCard

```
base:     rounded-2xl border border-white/10 bg-white/5 p-6
hover:    hover:-translate-y-1 hover:border-white/20 transition-all
shadow:   shadow-lg shadow-black/20
```

Opcionalmente incluyen blobs decorativos (`bg-cyan-500/20 blur-2xl rounded-full`) posicionados en absolute para dar profundidad visual.

### Modal

```
overlay:    fixed inset-0 bg-black/70 backdrop-blur-sm z-50
container:  bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-2xl fade-in
header:     border-b border-white/10 bg-white/5 p-4
body:       p-4 overflow-y-auto max-h-[calc(80vh-120px)] scrollbar-thin
footer:     p-4 border-t border-white/10 bg-white/5
```

### Input / Textarea

```
base:   bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-sm
focus:  focus:outline-none focus:ring-1 focus:ring-cyan-400
```

Usar `font-mono` solo cuando el valor es técnico (hex, código, URL). Body text usa Space Grotesk.

### Checkbox / Radio

```
input:  w-4 h-4 rounded bg-gray-800 border-gray-600 text-[color]-500 focus:ring-[color]-500
label:  flex items-center gap-2 cursor-pointer text-gray-400
```

Colores disponibles: blue, purple, orange, green, cyan. Usar el color del contexto del form.

### Tab Bar

```
container:  flex border-b border-white/10
tab:        px-3 py-2 text-sm text-gray-400 transition-colors
active:     bg-blue-500/20 border-b-2 border-blue-400 text-white
```

### Toast

```
base:    w-80 flex items-center gap-3 px-4 py-3 rounded border
success: bg-green-500/20 border-green-500/30 text-green-300
error:   bg-red-500/20 border-red-500/30 text-red-300
info:    bg-blue-500/20 border-blue-500/30 text-blue-300
```

### Sidebar

```
base:    fixed inset-y-0 right-0 z-40 w-64 border-l border-white/10
         bg-gray-900 shadow-2xl shadow-black/30
closed:  translate-x-full
open:    translate-x-0
transition: transition-transform duration-300
```

### Navegación (nav items)

```
base:    px-3 py-2 rounded transition-colors text-gray-400 flex items-center gap-2
hover:   hover:bg-white/5 hover:text-white
active:  bg-white/10 text-white
```

---

## Do / Don't

### Do

- **Usar opacity-based colors** — `bg-blue-500/20` en vez de `bg-blue-900`. Mantiene la coherencia oscura.
- **`backdrop-blur-sm` en capas flotantes** — modales, dropdowns, sidebar. Es parte de la identidad.
- **`transition-all` en elementos interactivos** — botones, cards, nav items. Sin duración explícita = 200ms de Tailwind.
- **`focus:ring-cyan-400`** en inputs. El accent cyan es el color de foco estándar; no cambiarlo por contexto.
- **`text-gray-400` en labels secundarios** — no `text-white/50` que varía con el fondo.
- **`font-mono`** para valores técnicos dentro de inputs o displays de datos. No para labels.
- **`rounded-2xl`** en modales y dialogs. **`rounded-xl`** en panels. **`rounded-lg`** en cards compactas.

### Don't

- **No usar colores sólidos oscuros** como `bg-gray-800` o `bg-slate-800` para superficies principales. La identidad es semitransparente.
- **No usar más de 3 acentos cromáticos** en un mismo componente. El sistema soporta multi-color pero un componente individual debe ser monocromático o bicromático.
- **No mezclar tamaños de border-radius** dentro del mismo componente (ej.: `rounded-xl` en el card y `rounded-2xl` en el header interno).
- **No `text-white`** en body copy o labels secundarios. Reservar para estados activos y títulos.
- **No quitar `transition-all`** de elementos interactivos. La suavidad es parte del feel.
- **No usar `blur-xl`** o superior en backdrop de elementos que no sean modales. Los blurs pesados solo en overlays de pantalla completa.
- **No `uppercase`** en títulos o botones. Solo en labels de categoría con `tracking-[0.2em]`.

---

## Deuda de diseño

- **Inconsistencia en padding de cards**: algunos usan `p-3 sm:p-4`, otros `p-4` fijo, y PlaygroundCard usa `p-6`. Falta un token unificado de `padding_card`.
- **`bg-gray-900` vs `bg-white/5` mezclados**: el fondo de modales usa `bg-gray-900` (solid) mientras los paneles usan `bg-white/5` (transparente). En contextos de superposición, `bg-gray-900` puede generar inconsistencia visual.
- **Focus styles duplicados**: hay `focus:ring-cyan-400` en inputs pero `outline: 2px solid #60a5fa` (blue) definido en el CSS global para elementos genéricos. El accent de foco no es uniforme: cyan para inputs explícitos, azul para focus-visible genérico.
- **Letter spacing variable**: aparece `tracking-[0.2em]` y `tracking-[0.25em]` en distintos componentes para el mismo patrón de label uppercase. Unificar en `0.2em`.
- **Íconos por CDN**: Font Awesome 6.4.0 se carga desde CDN externo. En una futura versión, bundlearlo o migrar a un icon set tree-shakeable.

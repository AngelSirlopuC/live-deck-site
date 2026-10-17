<!-- source: live-deck/skills/live-deck/references/deck-format.md sha256:c69fab921f18 -->
# Formato del deck v1

Fuente de verdad: `shared/deck.ts`. Todos los objetos son estrictos: las claves desconocidas no pasan la validación.

## Deck

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `version` | `1` | Obligatorio, literal 1. |
| `title` | string | Obligatorio, 1–200 caracteres. Se muestra en las listas y en el resumen. |
| `theme` | object | Opcional. Por defecto `{ background: "#10131a", foreground: "#f4f1ea", accent: "#ff7a45", muted: "#9aa3b2" }`. Es preferible `{ "preset": "<name>" }`. |
| `slides` | Slide[] | Obligatorio, 1–200. Los ids de las diapositivas son únicos. |

## Tema

Los colores van en hex: `#` + 3–8 dígitos hexadecimales.

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `preset` | `"estudio"` \| `"editorial"` \| `"neon"` \| `"papel"` \| `"brutalista"` \| `"corporativo"` | Opcional. Trae colores, fuentes (display/body/mono), fondo de diapositiva (degradado y/o patrón), estilo de tarjeta, estilo de títulos y paleta de gráficos. Ver `themes.md`. |
| `background` | hex | Obligatorio sin `preset`; con uno, es un reemplazo opcional. |
| `foreground` | hex | Obligatorio sin `preset`; con uno, es un reemplazo opcional. |
| `accent` | hex | Obligatorio sin `preset`; con uno, es un reemplazo opcional. |
| `muted` | hex | Opcional. |
| `surface` | hex | Opcional. Reemplaza el color de tarjeta/superficie (tarjetas, texto con `card: true`, separaciones del gráfico de dona). |

- Con un preset, reemplaza colores solo cuando la marca del usuario lo exija: `{ "preset": "corporativo", "accent": "#0057b8" }`.
- Sin preset se mantienen exactamente las reglas de antes: `background`, `foreground` y `accent` son obligatorios, `muted` es opcional.

## Diapositiva

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id` | string | Obligatorio, `[A-Za-z0-9_-]{1,40}`, único en el deck. |
| `layout` | `"free"` \| `"quiz"` | Opcional, por defecto free. `"quiz"` requiere `quiz`, y `quiz` requiere `"quiz"`. |
| `background` | hex \| Background | Opcional, reemplaza el fondo del tema. Ver más abajo. |
| `notes` | string | Opcional (ponlo siempre), máximo 5000 caracteres. Solo para quien presenta; nunca se envía al público. |
| `elements` | Element[] | Obligatorio (usa `[]` en las diapositivas de quiz), máximo 60. Los ids de los elementos son únicos por diapositiva. |
| `quiz` | Quiz | Solo con `layout: "quiz"`. |

### Objeto de fondo de la diapositiva

Un string hex sigue funcionando (`"background": "#0b0d12"`). La forma de objeto (todos los campos opcionales, estricta):

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `color` | hex | Color base sólido. |
| `gradient` | `{ "from": hex, "to": hex, "angle"?: number }` | Degradado lineal; `angle` 0–360 (grados). |
| `image` | asset src | Mismas reglas que el `src` de una imagen (`https://…` o `assets/<file>`, sin `..`). Cubre toda la diapositiva. |
| `dim` | number 0–0.9 | Oscurece la imagen para que el texto siga siendo legible. Usa 0.4–0.6 debajo de texto. |
| `pattern` | `"dots"` \| `"grid"` \| `"lines"` \| `"noise"` | Textura sutil sobre el color/degradado. |

```json
{ "background": { "gradient": { "from": "#1b1f3a", "to": "#0b0d12", "angle": 135 }, "pattern": "dots" } }
```

Omite `background` en la mayoría de diapositivas: el preset ya trae uno. Usa el objeto para aperturas, separadores de sección y cierres.

Las diapositivas importadas (`live-deck import`) usan exactamente este campo: `"background": { "image": "assets/slide-01.png" }` sin un layout nuevo; encima pueden ir elementos como el `qr` para unirse.

## Campos comunes de los elementos

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `id` | string | `[A-Za-z0-9_-]{1,40}`, único en la diapositiva. Los efectos (ripple, focus, zoom) lo usan como objetivo. |
| `type` | `"text"` \| `"image"` \| `"shape"` \| `"qr"` \| `"icon"` \| `"chart"` \| `"decor"` | Discriminador. No hay otros tipos: no se permite HTML ni SVG libre. |
| `box` | `{ x, y, w, h }` | Normalizado 0..1 sobre el lienzo 16:9, con origen arriba a la izquierda. `x + w <= 1`, `y + h <= 1`. |
| `fragment` | integer 1–20 | Opcional. El elemento aparece en ese paso; si no está = siempre visible. |

### text

- `text`: string, máximo 2000. `\n` hace saltos de línea.
- `style` (opcional, todo opcional):
  - `fontSize` 8–400 (px lógicos sobre 1920x1080)
  - `fontWeight` 400 \| 500 \| 600 \| 700 \| 800
  - `font` `"display"` \| `"body"` \| `"mono"`
  - `italic` boolean
  - `color` hex
  - `align` `"left"` \| `"center"` \| `"right"`
  - `valign` `"top"` \| `"middle"` \| `"bottom"`
  - `lineHeight` 0.8–3
  - `background` hex (relleno de tarjeta)
  - `radius` 0–540 (px)
  - `padding` 0–200 (px)
  - `card` boolean: dibuja la tarjeta del preset (color de superficie, radio, borde, sombra). No lo combines con `background` ni `radius`; deja que el preset decida.
  - `uppercase` boolean
  - `tracking` -0.05–0.3 (espaciado entre letras en em; un valor negativo aprieta los textos display grandes, uno positivo abre las etiquetas pequeñas en mayúsculas)
  - `mark` boolean: subrayado resaltado con el color de acento detrás del texto. Úsalo en una sola frase corta por diapositiva.

### image

- `src`: `https://…` o `assets/<path>` (caracteres `[A-Za-z0-9_\-./]`, sin `..`, máximo 500). Los archivos locales van en `decks/<id>/assets/`; la CLI falla si falta el archivo.
- `alt`: string, obligatorio, máximo 300.
- `fit`: `"contain"` \| `"cover"` (opcional).
- `style`: solo `{ radius }`.

### shape

- `shape`: `"rect"` \| `"ellipse"` \| `"line"`. Una línea horizontal usa `h: 0`.
- `style` (opcional): `fill` hex, `stroke` hex, `strokeWidth` 0–40, `radius` 0–540.

### qr

Muestra en tiempo de ejecución el QR y la URL para unirse a la sesión. No lleva contenido.
- `style` (opcional): solo `color` y `background` (hex). Usa un fondo claro con color oscuro para que se pueda escanear bien.
- Pon uno en la diapositiva 1. Mantenlo de al menos 0.25 de ancho y más o menos cuadrado en pantalla (`h ≈ w × 16/9`).

### icon

Un ícono de Lucide seleccionado. La lista oficial es `ICON_NAMES` en `shared/icons.ts` (~80 nombres en kebab-case); cualquier otro nombre no pasa la validación. Revisa el archivo cuando tengas dudas.

- `name`: una entrada de `ICON_NAMES`, por ejemplo `"rocket"`.
- `style` (opcional): `color` hex, `background` hex (un recuadro relleno detrás del ícono), `strokeWidth` 1–3, `radius` px (redondea el recuadro de fondo).
- Color por defecto: el acento del preset, o el color del texto cuando el acento es demasiado tenue sobre su fondo (menos de 3:1, por ejemplo amarillo sobre papel claro en `brutalista`). Define `color` solo para forzar un tono específico.
- Mantén la caja más o menos cuadrada en pantalla: `h ≈ w × 16/9` (por ejemplo `w: 0.08, h: 0.142`).

Nombres representativos (verifícalos contra `ICON_NAMES`):

| Significado | Nombres |
| --- | --- |
| Personas y conversación | `users`, `user`, `message-circle`, `heart`, `smile`, `thumbs-up`, `hand` |
| Ideas y metas | `lightbulb`, `target`, `rocket`, `sparkles`, `trophy`, `flag` |
| Datos y crecimiento | `bar-chart-3`, `trending-up`, `trending-down`, `pie-chart`, `database` |
| Seguridad | `shield-check`, `lock`, `key`, `alert-triangle`, `check-circle` |
| Tiempo y lugar | `clock`, `calendar`, `map-pin`, `globe` |
| Tecnología y trabajo | `code`, `cpu`, `cloud`, `zap`, `settings`, `book-open`, `graduation-cap` |

### chart

Gráfico de datos simple dibujado como SVG. Úsalo cuando el contenido tenga de 2 a 8 números reales; nunca inventes datos.

- `kind`: `"bar"` \| `"donut"`.
- `data`: arreglo de `{ "label": string (máximo 40 caracteres), "value": number >= 0 }`. Barras: 1–8 puntos, una sola serie. Dona: 2–6 porciones.
- `unit` (opcional): string, máximo 8 caracteres, se añade a los valores (`"%"`, `" h"`, `"k"`).
- `style` (opcional): solo `color` hex (color de las barras; por defecto el acento). La dona usa la paleta categórica del preset en orden fijo.
- Las barras muestran etiquetas de valor sobre cada barra y no tienen leyenda. La dona muestra una leyenda con los valores y el total al centro.
- Dale espacio: al menos `w: 0.4, h: 0.5`.

### decor

Forma SVG decorativa incorporada. No lleva contenido: nunca pongas significado en un decor.

- `shape`: `"blob"` \| `"wave"` \| `"dots"` \| `"rings"` \| `"arc"` \| `"squiggle"` \| `"star"` \| `"grid"`.
- `style` (opcional): `color` hex (por defecto el acento), `opacity` 0.05–1.
- Colócalo antes del texto en `elements` para que se dibuje detrás; mantenlo fuera del texto, normalmente pegado a una esquina o a un borde (las cajas no pueden salir del lienzo). Uno o dos por diapositiva como máximo.

## Quiz

| Campo | Tipo | Reglas |
| --- | --- | --- |
| `question` | string | 1–300 caracteres. |
| `options` | string[] | 2–6 ítems, cada uno de 1–120 caracteres. El público responde con A–F o 1–6. |
| `correctIndex` | integer | Empieza en 0, debe ser < la cantidad de opciones. Exactamente una respuesta correcta. |
| `display` | `"live"` \| `"secret"` | live: los votos se ven mientras se vota. secret: ocultos hasta que quien presenta los revele. |
| `timerSec` | integer | Opcional, 5–600. |
| `results` | `"ranking"` \| `"grid"` | Opcional. Cómo se muestran los resultados visibles: `"ranking"` (por defecto) reordena las opciones por votos y resalta el primer lugar; `"grid"` mantiene la disposición fija A–F. |
| `zones` | `{ x, y, w, h }[]` | Opcional. Quiz por zonas sobre una imagen diseñada: cajas normalizadas con las mismas reglas que las cajas de los elementos (0..1, `x + w <= 1`, `y + h <= 1`), exactamente una por opción, en el orden de las opciones. `zones.length` debe ser igual a `options.length` (ruta del error `quiz.zones`). |

### Quizzes por zonas (`quiz.zones`)

- Se usan en diapositivas diseñadas e importadas: la diapositiva mantiene `background: { "image": "assets/<file>" }` y `elements: []`, y la imagen ya muestra la pregunta y las opciones.
- Con `zones`, el reproductor no dibuja la cuadrícula nativa de pregunta/opciones. Dibuja una capa por zona sobre su caja: relleno translúcido de votos (proporción de votos), insignia de porcentaje, insignia de puesto (1º, 2º… cuando los resultados son visibles), marca de correcta/incorrecta después de revelar, el contorno del voto propio de cada asistente y el resaltado de la opción que va primera. Tocar una zona también cuenta como voto. En el modo por zonas las opciones nunca se reordenan (`results: "ranking"` no mueve las zonas). La línea de estado (votos, temporizador) aparece en una pequeña píldora en la parte inferior de la diapositiva.
- `question` y `options` siguen siendo obligatorios y deben coincidir con el texto de la imagen: los celulares, el panel de quien presenta y el resumen los muestran.
- `/preview/<id>` dibuja contornos punteados con la letra de la opción en cada zona para revisar la alineación; las sesiones en vivo nunca los muestran.
- Método completo y ejemplos: `zone-quizzes.md`.

La respuesta y las notas se eliminan antes de que el deck llegue al público.

## Mensajes de validación

La CLI imprime `path: message`, donde path es la ruta dentro del JSON (`slides.2.quiz.correctIndex: correctIndex must point to an option`). Corrige en esa ruta y vuelve a ejecutar.

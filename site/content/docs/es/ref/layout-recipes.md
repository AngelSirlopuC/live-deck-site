<!-- source: live-deck/skills/live-deck/references/layout-recipes.md sha256:9f53a3c85256 -->
# Recetas de layout

Las cajas son `{ x, y, w, h }` normalizadas sobre un lienzo 16:9. Los tamaños de fuente son px lógicos sobre 1920x1080. Los márgenes laterales son 0.07; el ancho del contenido es 0.86. Copia una receta, cambia los ids y el texto, y mantén la geometría.

## title-qr (diapositiva 1, obligatoria)

```json
[
  { "id": "kicker", "type": "text", "box": { "x": 0.07, "y": 0.14, "w": 0.5, "h": 0.06 }, "text": "EVENTO · FECHA", "style": { "fontSize": 30, "fontWeight": 700, "font": "mono", "color": "#ff7a45" } },
  { "id": "title", "type": "text", "box": { "x": 0.07, "y": 0.22, "w": 0.52, "h": 0.36 }, "text": "Título de hasta ocho palabras", "style": { "fontSize": 96, "fontWeight": 800, "font": "display", "lineHeight": 1.05 } },
  { "id": "subtitle", "type": "text", "box": { "x": 0.07, "y": 0.64, "w": 0.48, "h": 0.12 }, "text": "Escanea el código para unirte.", "style": { "fontSize": 36, "color": "#9aa3b2", "lineHeight": 1.3 } },
  { "id": "qr", "type": "qr", "box": { "x": 0.64, "y": 0.16, "w": 0.29, "h": 0.68 }, "style": { "background": "#f4f1ea", "color": "#10131a" } }
]
```

## heading-bullets (fragmentos)

Título en `{ x: 0.07, y: 0.1, w: 0.86, h: 0.14 }`, fontSize 80, weight 800, font display. Hasta 4 viñetas, `h: 0.14`, en `y` 0.32, 0.5, 0.68 (y 0.86 solo con `h: 0.1`), fontSize 44, `fragment` 1..n.

## two-column

```json
[
  { "id": "h", "type": "text", "box": { "x": 0.07, "y": 0.1, "w": 0.86, "h": 0.14 }, "text": "Antes vs. después", "style": { "fontSize": 80, "fontWeight": 800, "font": "display" } },
  { "id": "left", "type": "text", "box": { "x": 0.07, "y": 0.3, "w": 0.4, "h": 0.56 }, "text": "Columna izquierda\nsegunda línea", "style": { "fontSize": 40, "lineHeight": 1.3, "background": "#1b2130", "radius": 24, "padding": 40 } },
  { "id": "right", "type": "text", "box": { "x": 0.53, "y": 0.3, "w": 0.4, "h": 0.56 }, "text": "Columna derecha\nsegunda línea", "fragment": 1, "style": { "fontSize": 40, "lineHeight": 1.3, "background": "#1b2130", "radius": 24, "padding": 40 } }
]
```

## agenda (tarjetas 2x2 con fragmentos)

Título como el anterior. Tarjetas `w: 0.4, h: 0.22` en (0.07, 0.32), (0.53, 0.32), (0.07, 0.6), (0.53, 0.6), `fragment` 1–4, estilo `{ "fontSize": 40, "lineHeight": 1.25, "background": "#1b2130", "radius": 24, "padding": 36 }`. Patrón de texto `"01\nPunto corto"`.

## big-number

```json
[
  { "id": "num", "type": "text", "box": { "x": 0.07, "y": 0.18, "w": 0.86, "h": 0.4 }, "text": "73 %", "style": { "fontSize": 260, "fontWeight": 800, "font": "display", "align": "center", "valign": "middle", "color": "#ff7a45" } },
  { "id": "label", "type": "text", "box": { "x": 0.15, "y": 0.62, "w": 0.7, "h": 0.16 }, "text": "de los asistentes revisa su celular en los primeros 10 minutos", "style": { "fontSize": 44, "align": "center", "lineHeight": 1.25 } }
]
```

## image-caption

```json
[
  { "id": "img", "type": "image", "box": { "x": 0.07, "y": 0.08, "w": 0.86, "h": 0.68 }, "src": "assets/photo.jpg", "alt": "Describe la imagen", "fit": "cover", "style": { "radius": 24 } },
  { "id": "caption", "type": "text", "box": { "x": 0.07, "y": 0.8, "w": 0.86, "h": 0.1 }, "text": "Leyenda de una línea", "style": { "fontSize": 36, "color": "#9aa3b2", "align": "center" } }
]
```

Imagen al lado del texto: imagen `{ x: 0.53, y: 0.12, w: 0.4, h: 0.76 }`, texto `{ x: 0.07, y: 0.12, w: 0.42, h: 0.76 }` con `valign: "middle"`.

## diagram (cajas y flechas)

Nodos `w: 0.22, h: 0.2` en `y: 0.42`, x 0.07 / 0.39 / 0.71, estilo `{ "align": "center", "valign": "middle", "radius": 28, "background": "#1b2130", "fontSize": 40 }`. Las flechas son `shape: "line"` con `h: 0` entre ellos, por ejemplo `{ "x": 0.3, "y": 0.52, "w": 0.09, "h": 0 }`, estilo `{ "stroke": "#9aa3b2", "strokeWidth": 6 }`.

## quiz

```json
{ "id": "quiz-1", "layout": "quiz", "notes": "…", "elements": [],
  "quiz": { "question": "…?", "options": ["A", "B", "C", "D"], "correctIndex": 2, "display": "live" } }
```

El reproductor dibuja la pregunta, las opciones, las barras y el temporizador; no agregues elementos.

## closing

```json
[
  { "id": "thanks", "type": "text", "box": { "x": 0.07, "y": 0.3, "w": 0.86, "h": 0.26 }, "text": "Gracias", "style": { "fontSize": 180, "fontWeight": 800, "font": "display", "align": "center", "valign": "middle" } },
  { "id": "contact", "type": "text", "box": { "x": 0.07, "y": 0.6, "w": 0.86, "h": 0.1 }, "text": "name@example.com", "style": { "fontSize": 36, "color": "#9aa3b2", "align": "center" } }
]
```

## Recetas con elementos enriquecidos

Estas suponen un `theme.preset`. A propósito no definen colores: el preset trae las fuentes, el estilo de tarjeta y la paleta. Las recetas que necesitan un `background` de diapositiva se muestran como diapositivas completas; cambia el `id`, los textos y las `notes`. Los íconos y los decor se dibujan en el orden de los elementos, así que el decor va primero.

### hero-gradient (apertura; mantiene el QR de la diapositiva 1)

```json
{ "id": "hero-gradient", "notes": "Da la bienvenida; pide a todos que escaneen el QR.",
  "background": { "gradient": { "from": "#1b1f3a", "to": "#0b0d12", "angle": 135 } },
  "elements": [
    { "id": "decor", "type": "decor", "shape": "rings", "box": { "x": 0.0, "y": 0.55, "w": 0.26, "h": 0.45 }, "style": { "opacity": 0.25 } },
    { "id": "kicker", "type": "text", "box": { "x": 0.07, "y": 0.14, "w": 0.5, "h": 0.06 }, "text": "Evento · fecha", "style": { "fontSize": 30, "fontWeight": 700, "font": "mono", "uppercase": true, "tracking": 0.12 } },
    { "id": "title", "type": "text", "box": { "x": 0.07, "y": 0.22, "w": 0.52, "h": 0.36 }, "text": "Título de hasta ocho palabras", "style": { "fontSize": 100, "fontWeight": 800, "font": "display", "lineHeight": 1.02, "tracking": -0.02 } },
    { "id": "qr", "type": "qr", "box": { "x": 0.64, "y": 0.16, "w": 0.29, "h": 0.68 }, "style": { "background": "#f4f1ea", "color": "#10131a" } }
  ] }
```

Elige los colores del degradado cerca del fondo del preset (presets oscuros: dos tonos oscuros; presets claros: dos tonos claros). Quita el `qr` solo cuando esta no sea la diapositiva 1.

### icon-row (3–4 ideas)

Columnas `w: 0.185` en x 0.07 / 0.295 / 0.52 / 0.745; íconos `w: 0.08, h: 0.142` centrados en cada columna. Para 3 ítems usa columnas `w: 0.26` en x 0.07 / 0.37 / 0.67 e íconos en x 0.16 / 0.46 / 0.76.

```json
[
  { "id": "h", "type": "text", "box": { "x": 0.07, "y": 0.1, "w": 0.86, "h": 0.14 }, "text": "Cuatro hábitos", "style": { "fontSize": 80, "fontWeight": 800, "font": "display" } },
  { "id": "i1", "type": "icon", "name": "lightbulb", "box": { "x": 0.1225, "y": 0.36, "w": 0.08, "h": 0.142 }, "fragment": 1 },
  { "id": "l1", "type": "text", "box": { "x": 0.07, "y": 0.55, "w": 0.185, "h": 0.2 }, "text": "Etiqueta corta", "fragment": 1, "style": { "fontSize": 36, "align": "center", "lineHeight": 1.25 } },
  { "id": "i2", "type": "icon", "name": "users", "box": { "x": 0.3475, "y": 0.36, "w": 0.08, "h": 0.142 }, "fragment": 2 },
  { "id": "l2", "type": "text", "box": { "x": 0.295, "y": 0.55, "w": 0.185, "h": 0.2 }, "text": "Etiqueta corta", "fragment": 2, "style": { "fontSize": 36, "align": "center", "lineHeight": 1.25 } },
  { "id": "i3", "type": "icon", "name": "shield-check", "box": { "x": 0.5725, "y": 0.36, "w": 0.08, "h": 0.142 }, "fragment": 3 },
  { "id": "l3", "type": "text", "box": { "x": 0.52, "y": 0.55, "w": 0.185, "h": 0.2 }, "text": "Etiqueta corta", "fragment": 3, "style": { "fontSize": 36, "align": "center", "lineHeight": 1.25 } },
  { "id": "i4", "type": "icon", "name": "rocket", "box": { "x": 0.7975, "y": 0.36, "w": 0.08, "h": 0.142 }, "fragment": 4 },
  { "id": "l4", "type": "text", "box": { "x": 0.745, "y": 0.55, "w": 0.185, "h": 0.2 }, "text": "Etiqueta corta", "fragment": 4, "style": { "fontSize": 36, "align": "center", "lineHeight": 1.25 } }
]
```

### big-number-card

```json
[
  { "id": "card", "type": "text", "box": { "x": 0.07, "y": 0.16, "w": 0.5, "h": 0.68 }, "text": "73 %", "style": { "fontSize": 220, "fontWeight": 800, "font": "display", "align": "center", "valign": "middle", "card": true, "tracking": -0.03 } },
  { "id": "label", "type": "text", "box": { "x": 0.62, "y": 0.16, "w": 0.31, "h": 0.68 }, "text": "de los asistentes revisa su celular en los primeros 10 minutos", "style": { "fontSize": 44, "lineHeight": 1.25, "valign": "middle" } }
]
```

### chart-bar

```json
[
  { "id": "h", "type": "text", "box": { "x": 0.07, "y": 0.08, "w": 0.86, "h": 0.12 }, "text": "Respuestas por minuto", "style": { "fontSize": 72, "fontWeight": 800, "font": "display" } },
  { "id": "chart", "type": "chart", "kind": "bar", "box": { "x": 0.07, "y": 0.26, "w": 0.6, "h": 0.64 }, "unit": "%",
    "data": [ { "label": "Q1", "value": 42 }, { "label": "Q2", "value": 58 }, { "label": "Q3", "value": 71 }, { "label": "Q4", "value": 64 } ] },
  { "id": "takeaway", "type": "text", "box": { "x": 0.71, "y": 0.26, "w": 0.22, "h": 0.64 }, "text": "Q3 llegó a su pico después del quiz en vivo", "fragment": 1, "style": { "fontSize": 40, "lineHeight": 1.25, "valign": "middle" } }
]
```

### chart-donut

```json
[
  { "id": "h", "type": "text", "box": { "x": 0.07, "y": 0.08, "w": 0.86, "h": 0.12 }, "text": "En qué se va el tiempo", "style": { "fontSize": 72, "fontWeight": 800, "font": "display" } },
  { "id": "chart", "type": "chart", "kind": "donut", "box": { "x": 0.17, "y": 0.24, "w": 0.66, "h": 0.68 }, "unit": " h",
    "data": [ { "label": "Reuniones", "value": 12 }, { "label": "Trabajo enfocado", "value": 18 }, { "label": "Correo", "value": 6 } ] }
]
```

### quote-mark

```json
[
  { "id": "decor", "type": "decor", "shape": "squiggle", "box": { "x": 0.07, "y": 0.12, "w": 0.16, "h": 0.12 }, "style": { "opacity": 0.6 } },
  { "id": "quote", "type": "text", "box": { "x": 0.07, "y": 0.28, "w": 0.78, "h": 0.4 }, "text": "La mejor diapositiva es la que el público recuerda", "style": { "fontSize": 84, "fontWeight": 700, "font": "display", "lineHeight": 1.1, "tracking": -0.02, "mark": true } },
  { "id": "author", "type": "text", "box": { "x": 0.07, "y": 0.74, "w": 0.6, "h": 0.08 }, "text": "— Autor, cargo", "style": { "fontSize": 34, "font": "mono" } }
]
```

`mark` resalta todo el elemento de texto: mantén la cita corta (<= 12 palabras) o separa la frase clave en su propio elemento.

### section-break (una palabra)

```json
{ "id": "section-break", "notes": "Haz una pausa; anuncia la nueva parte.",
  "background": { "image": "assets/section.jpg", "dim": 0.55 },
  "elements": [
    { "id": "word", "type": "text", "box": { "x": 0.07, "y": 0.3, "w": 0.86, "h": 0.4 }, "text": "Práctica", "style": { "fontSize": 220, "fontWeight": 800, "font": "display", "align": "center", "valign": "middle", "uppercase": true, "tracking": -0.02, "color": "#ffffff" } }
  ] }
```

Sin foto, usa `"background": { "color": "#0b0d12", "pattern": "grid" }` (elige un color del mundo del preset) y quita el `color` que se reemplaza en el texto. `assets/section.jpg` debe existir en `decks/<id>/assets/`.

## Diapositivas diseñadas importadas

Las diapositivas importadas con `live-deck import` son imágenes completas diseñadas en otra herramienta. No pongas texto encima; agrega solo notas, el `qr` de la diapositiva 1, o convierte una pregunta diseñada en un quiz por zonas (`zone-quizzes.md`).

### imported-slide

```json
{ "id": "s02", "notes": "Explica el diagrama de izquierda a derecha y pregunta quién lo ha usado.",
  "background": { "image": "assets/slide-02.png" },
  "elements": [] }
```

La diapositiva 1 también lleva encima de la imagen el QR para unirse. La importación lo coloca abajo a la derecha sobre un recuadro blanco; conserva la caja que escribió el CLI y edítala solo para mover el QR fuera de contenido importante (geometría de ejemplo):

```json
{ "id": "s01", "notes": "Da la bienvenida y pide que escaneen el QR.",
  "background": { "image": "assets/slide-01.png" },
  "elements": [
    { "id": "qr", "type": "qr", "box": { "x": 0.81, "y": 0.66, "w": 0.16, "h": 0.3 }, "style": { "background": "#ffffff", "color": "#000000" } }
  ] }
```

### zone-quiz (opciones diseñadas en 2x2)

Sirve para un quiz diseñado típico: la pregunta arriba de lado a lado y cuatro tarjetas de opciones en una cuadrícula de 2x2. Mide las zonas reales desde la imagen antes de usarlo; estas cajas son solo un punto de partida.

```json
{ "id": "s05", "layout": "quiz", "notes": "Deja 30 s y revela. La correcta es la C: el sol.",
  "background": { "image": "assets/slide-05.png" },
  "elements": [],
  "quiz": {
    "question": "¿Cuál es la principal fuente de energía de la Tierra?",
    "options": ["El viento", "El petróleo", "El sol", "El núcleo terrestre"],
    "correctIndex": 2,
    "display": "secret",
    "timerSec": 30,
    "zones": [
      { "x": 0.06, "y": 0.34, "w": 0.43, "h": 0.25 },
      { "x": 0.51, "y": 0.34, "w": 0.43, "h": 0.25 },
      { "x": 0.06, "y": 0.62, "w": 0.43, "h": 0.25 },
      { "x": 0.51, "y": 0.62, "w": 0.43, "h": 0.25 }
    ]
  } }
```

Las zonas siguen el orden de las opciones (aquí, A arriba a la izquierda, B arriba a la derecha, C abajo a la izquierda, D abajo a la derecha). Deja libre el ~8% inferior: ahí aparece la píldora de votos/temporizador.

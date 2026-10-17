<!-- source: live-deck/skills/live-deck/references/zone-quizzes.md sha256:1d9dd0205f01 -->
# Quizzes por zonas

Un quiz por zonas convierte en un quiz en vivo una diapositiva importada que está claramente diseñada como una pregunta con opciones. La imagen se queda tal como fue diseñada; Live Deck dibuja encima de la zona de cada opción el relleno de votos, el porcentaje, la insignia de puesto (1º, 2º…), el voto propio de cada asistente y, después de revelar, el verde de la respuesta correcta (las incorrectas quedan marcadas). Tocar una zona en la pantalla también cuenta como voto. Los celulares, el panel de quien presenta y el resumen muestran el texto de `question` y `options`.

## JSON

```json
{ "id": "s07", "layout": "quiz", "notes": "Lee la pregunta en voz alta, espera 20 s y revela. Correcta: B (2009).",
  "background": { "image": "assets/slide-07.png" },
  "elements": [],
  "quiz": {
    "question": "¿En qué año se lanzó la primera versión de Node.js?",
    "options": ["2005", "2009", "2012"],
    "correctIndex": 1,
    "display": "live",
    "timerSec": 20,
    "zones": [
      { "x": 0.08, "y": 0.4, "w": 0.26, "h": 0.36 },
      { "x": 0.37, "y": 0.4, "w": 0.26, "h": 0.36 },
      { "x": 0.66, "y": 0.4, "w": 0.26, "h": 0.36 }
    ]
  } }
```

- `layout: "quiz"`, `elements: []`, `background: { "image": "assets/<file>" }` (la imagen importada; conserva la ruta que escribió la importación).
- `quiz.question`, `quiz.options` (2–6), `quiz.correctIndex`, `quiz.display` (`"live"` o `"secret"`) son obligatorios como en cualquier quiz; `timerSec` (5–600) es opcional.
- `quiz.zones`: un `{ x, y, w, h }` por opción.

## Reglas

1. Exactamente una zona por opción, en el orden de las opciones: `zones[0]` es la opción A, `zones[1]` es la B, y así sucesivamente. `zones.length` debe ser igual a `options.length` (error de validación en `quiz.zones`).
2. Las cajas se normalizan igual que las cajas de los elementos: cada valor en 0..1, `x + w <= 1`, `y + h <= 1`.
3. Una zona cubre toda el área clicable de la opción en la imagen (tarjeta, botón o etiqueta con su letra) más un pequeño margen, de unos 0.005–0.01 por cada lado. Las zonas no deben superponerse entre sí.
4. En el modo por zonas las opciones nunca se reordenan en pantalla: las capas se quedan sobre sus zonas; `results: "ranking"` no las mueve.
5. `question` y `options` deben coincidir con el texto de la imagen (mismas palabras, mismo orden, misma letra o número), porque los celulares muestran el texto, no la imagen. Acorta solo para respetar los límites (pregunta <= 300 caracteres, opción <= 120) y mantén el sentido.
6. Deja libre el borde inferior de la diapositiva cuando se pueda: ahí aparece la píldora de votos/temporizador.
7. En un quiz por zonas el reproductor no dibuja la cuadrícula nativa de pregunta/opciones; las pone la imagen.

## Medir las zonas desde una imagen

La importación espera una exportación de 1920x1080 (16:9), así que las coordenadas en píxeles corresponden directamente al lienzo.

1. Abre la imagen (`decks/<id>/assets/slide-NN.png`) y revisa su tamaño; si no es de 1920x1080, usa su ancho real `W` y su alto real `H` (la importación avisó si no es 16:9; pide que la vuelvan a exportar cuando la proporción no cuadre).
2. Para cada opción, ubica su caja delimitadora en píxeles: izquierda `px`, arriba `py`, derecha `px2`, abajo `py2`.
3. Convierte: `x = px / W`, `y = py / H`, `w = (px2 - px) / W`, `h = (py2 - py) / H`.
4. Agrega el margen: resta ~0.005–0.01 a `x` y a `y`, suma el doble de eso a `w` y a `h`, y luego ajusta los valores para que `x, y >= 0` y `x + w <= 1`, `y + h <= 1`.
5. Redondea a 3 decimales y escribe las zonas en el orden de las opciones.

Ejemplo: la opción B es una tarjeta que va de (980, 390) a (1800, 650) en una imagen de 1920x1080.

- `x = 980 / 1920 = 0.510`, `y = 390 / 1080 = 0.361`
- `w = 820 / 1920 = 0.427`, `h = 260 / 1080 = 0.241`
- Con un margen de 0.005: `{ "x": 0.505, "y": 0.356, "w": 0.437, "h": 0.251 }` (`x + w = 0.942`, `y + h = 0.607`, dentro del lienzo).

Luego valida y pídele al usuario que abra `/preview/<id>`: dibuja un contorno punteado con la letra de la opción en cada zona (solo en la vista previa, nunca en vivo). Ajusta cualquier zona que no calce con su opción y vuelve a validar.

## Elegir la respuesta correcta

- Tómala del material del usuario: una respuesta marcada en la diapositiva, las notas del presentador, una clave de respuestas o el mensaje del usuario.
- Si no está indicada, pregúntale al usuario cuál es la opción correcta antes de terminar el deck. Nunca adivines en silencio; si tienes que proponer una, dilo de forma explícita y pide que la confirme.
- Pon la respuesta también en `notes` (se elimina antes de que el deck llegue al público, igual que `correctIndex`).

## Cuándo usar un quiz nativo en su lugar

Inserta una diapositiva de quiz nativo (receta `quiz` en `layout-recipes.md`, sin `zones`) cuando:

- ninguna diapositiva está diseñada como quiz (no hay una pregunta con opciones en ninguna imagen);
- el texto de las opciones en la imagen es demasiado pequeño para leerse desde el auditorio o para medirlo de forma confiable;
- las opciones no están separadas visualmente (un solo párrafo, formas superpuestas, sin un área clara para cada opción);
- hay más de 6 opciones, o el diseño no deja ver cuáles son las áreas de las opciones.

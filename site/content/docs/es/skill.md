<!-- source: site/content/docs/skill.md sha256:db060b1f6296 -->
# Skill de Claude

El skill `live-deck` le enseña a Claude a convertir una idea, un esquema, unas notas o el texto pegado de un .pptx en un `deck.json` válido, validarlo con la CLI y corregir todos los problemas.

```sh
npx skills add AngelSirlopuC/live-deck   # instala skills/live-deck
```

Luego pídeselo desde la raíz del repositorio de Live Deck:

```text
Crea un live deck sobre contraseñas seguras, en español, con un quiz.
```

## Qué hace el skill

1. **Planifica** una idea por diapositiva, de 5 a 25 diapositivas para una charla normal, y un quiz cada 4 a 8 diapositivas cuando el público puede responder algo.
2. **Dirige el arte**: elige exactamente un [preset de tema](/docs/themes/) según el tema, el público y el lugar, y te dice por qué.
3. **Crea la estructura** con `live-deck new <id>` y reemplaza las diapositivas de la plantilla usando [recetas de diseño](/docs/layouts/) probadas.
4. **Valida** con `live-deck validate <id>` y corrige cada problema que se muestra hasta que imprime `OK <title> (<n> slides, <q> quizzes)`.
5. **Entrega** la ruta del deck, el preset y su porqué, la cantidad de diapositivas y de quizzes, y la URL de la vista previa.

El contenido del deck (títulos, textos, notas, preguntas de los quizzes, texto alternativo) se escribe en tu idioma.

## Prompts que funcionan

- "Crea un live deck sobre nuestro lanzamiento del tercer trimestre para el equipo de ventas, sala iluminada, 12 diapositivas."
- "Convierte estas notas en un live deck y agrega un quiz después de cada sección."
- "Convierte este texto pegado de un .pptx en un live deck. Mantén los títulos de mis diapositivas."
- "Agrega un quiz secreto con un temporizador de 30 segundos después de la diapositiva 6."
- "Arregla el deck `my-talk`: no pasa la validación."

## Importar diapositivas diseñadas

¿Ya diseñaste tus diapositivas en PowerPoint, Keynote, Google Slides, Canva o Figma? Live Deck conserva tu diseño como imágenes y le agrega la capa en vivo (QR de ingreso, quizzes, chat, reacciones, efectos).

1. Exporta un PNG o JPG por diapositiva a 1920×1080 (16:9) en una sola carpeta, con nombres que se ordenen correctamente (`slide1.png`, `slide2.png`, … se ordenan de forma natural).
2. Pídele a Claude que las importe, o ejecuta la CLI tú mismo:

   ```sh
   npm run deck -- import ./exported --id my-talk --title "My talk"
   ```

3. Claude revisa cada imagen y escribe las notas del presentador, inserta diapositivas de quiz nativas donde ayudan y convierte las diapositivas diseñadas como una pregunta con opciones en [quizzes por zonas](/docs/quizzes/#quizzes-por-zonas).
4. Abre `/preview/<id>` y verifica que los contornos punteados de las zonas caigan sobre las opciones que diseñaste. Los contornos solo aparecen en la vista previa, nunca en una sesión en vivo.

El QR de ingreso se superpone en la diapositiva 1 (abajo a la derecha, en un recuadro blanco). Para moverlo, edita el `box` del elemento `qr` en la diapositiva 1, manteniéndolo de al menos 0.25 de ancho y más o menos cuadrado en pantalla.

## Otros agentes

El skill está pensado para Claude, pero nada en el formato es exclusivo de Claude: el [formato del deck](/docs/deck-format/) está documentado y la [CLI](/docs/cli/) valida cualquier archivo, así que cualquier agente que pueda editar archivos y ejecutar una terminal puede escribir un deck. Consulta [Agentes y MCP](/docs/mcp/) para saber por qué hoy no hay un servidor MCP.

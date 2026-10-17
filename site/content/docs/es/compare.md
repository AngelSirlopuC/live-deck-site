<!-- source: site/content/docs/compare.md sha256:23db95375fb7 -->
# Live Deck frente a otras herramientas

Live Deck es un reproductor de presentaciones de código abierto (MIT) y autoalojado en el que las propias diapositivas son la superficie en vivo: el público entra desde el navegador del celular y sigue el deck, responde quizzes y ve los gestos del presentador en tiempo real. Las herramientas de encuestas como Slido, Mentimeter y AhaSlides son servicios alojados que funcionan al costado de tus diapositivas, y los frameworks de código como Slidev y Reveal.js crean diapositivas sin votación del público incorporada. Live Deck está entre los dos: un solo reproductor que muestra el deck y maneja la interacción con el público, en un servidor que tú mismo administras.

## Live Deck frente a las herramientas de encuestas (Slido, Mentimeter, AhaSlides)

Slido, Mentimeter y AhaSlides son servicios de interacción con el público alojados por sus proveedores. Sigues presentando desde tu software de diapositivas de siempre y abres la herramienta de encuestas al costado, con una app aparte o una integración. Live Deck va por el otro camino: el deck y la interacción son lo mismo. Cada celular muestra la diapositiva actual, un quiz es una diapositiva y los efectos del puntero caen en el mismo lugar del proyector y de cada celular.

| | Live Deck | Herramientas de encuestas |
| --- | --- | --- |
| Dónde corre | Tu servidor: un proceso de Node.js en un contenedor Docker, sin base de datos | Alojado por el proveedor |
| Cómo entra el público | Escanea el QR de la primera diapositiva y lo abre en el navegador del celular, sin app | Con el flujo de ingreso del proveedor |
| Qué ve el público | Las propias diapositivas, más quizzes, reacciones y chat | La encuesta o actividad, al costado de tus diapositivas |
| Gestos del presentador | Señalar, Enfocar y Zoom, reflejados en todas las pantallas | Tus diapositivas se muestran en otro software |
| Regresar a diapositivas anteriores | El modo Explorar recorre las diapositivas ya mostradas; un toque vuelve a En vivo | Depende de la herramienta |
| Datos después de la sesión | Las sesiones viven en memoria; al terminar puedes descargar un resumen y luego los datos se eliminan | Los maneja el servicio del proveedor |
| Cómo se hacen los decks | Un archivo JSON, muchas veces escrito por Claude con la [skill](/docs/skill/), o diapositivas exportadas como imágenes desde PowerPoint, Keynote, Google Slides, Canva o Figma e importadas | Haces las diapositivas en tu software de siempre y agregas las encuestas en la herramienta |

Como Live Deck lo administras tú, los límites dependen de tu servidor. Está diseñado para unos 200 asistentes por sesión en un servidor pequeño.

## Live Deck frente a los frameworks de diapositivas (Slidev, Reveal.js, open-slide)

Slidev y Reveal.js son frameworks de diapositivas basados en código: escribes las diapositivas en Markdown o HTML y las presentas en el navegador. No traen votación del público incorporada, así que agregar encuestas en vivo significa escribir tu propio código. open-slide es un framework de diapositivas basado en React, pensado para agentes. Si te gusta escribir diapositivas como código, o pedirle a un agente que las escriba, Live Deck mantiene ese flujo: un deck es un archivo JSON que Claude puede escribir por ti, y las funciones para el público en vivo vienen incluidas.

| | Live Deck | Slidev / Reveal.js | open-slide |
| --- | --- | --- | --- |
| Cómo se crean | Deck en JSON, muchas veces escrito por Claude con una skill, o imágenes de diapositivas importadas | Markdown o HTML | React, pensado para agentes |
| Funciones para el público en vivo | Incluidas: quizzes (en vivo o secretos, temporizador, ranking), reacciones, chat con stickers, efectos del puntero reflejados, En vivo / Explorar | Sin votación del público incorporada; escribes tu propio código | Revisa la documentación del proyecto |
| Para quién es | Presentadores que quieren al público en sus celulares, con un deck escrito por un agente o exportado desde una herramienta de diseño | Desarrolladores que escriben diapositivas como código | Equipos que generan diapositivas con agentes |

## Live Deck frente a Claper

Claper es una herramienta de interacción con el público de código abierto y autoalojable, así que si lo que necesitas es autoalojar y usar código abierto, es una alternativa real que vale la pena evaluar. La diferencia está en la forma del producto: Live Deck es el propio reproductor de diapositivas. El deck, el quiz y los gestos del presentador llegan a cada celular como una sola superficie, y los asistentes pueden regresar por las diapositivas que ya se mostraron.

## Cuándo te conviene otra herramienta

Live Deck no es la opción correcta para todas las charlas:

- **Quieres un servicio alojado.** Live Deck no tiene versión alojada; lo administras tú. Si no quieres encargarte de un servidor, una herramienta de encuestas alojada es más simple.
- **Ya presentas desde PowerPoint y solo necesitas una encuesta.** Si solo quieres una o dos preguntas, una herramienta de encuestas al costado te pide menos.
- **Necesitas analíticas entre sesiones.** Live Deck no guarda datos después de una sesión: al terminarla puedes descargar un resumen y luego los datos se eliminan. Si quieres historial y reportes de muchos eventos, usa una herramienta hecha para eso.
- **Quieres diapositivas como código sin público en vivo.** Si nadie necesita votar ni seguir la charla en el celular, Slidev o Reveal.js pueden ser todo lo que necesitas.

## Pruébalo

- [Inicio rápido](/docs/quick-start/): corre Live Deck en tu computadora.
- [Skill de Claude](/docs/skill/): pídele un deck a Claude o importa diapositivas que diseñaste.

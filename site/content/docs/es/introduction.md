<!-- source: site/content/docs/introduction.md sha256:42fc25eb6e7b -->
# Introducción

Live Deck es un reproductor de presentaciones en vivo y en dos sentidos. El presentador maneja las diapositivas; el público las sigue en sus celulares, responde quizzes, reacciona y chatea, sin instalar nada.

A diferencia de las herramientas de encuestas que van al costado de las diapositivas, aquí las propias diapositivas son la superficie en vivo: el deck, el quiz y los gestos del presentador (señalar, enfocar, zoom) llegan a cada celular en tiempo real, y los asistentes que llegan tarde o se distraen pueden regresar por su cuenta.

## Cómo funciona una charla

1. **Escribe un deck.** Un deck es un archivo JSON en `decks/<id>/deck.json`. La forma más fácil es pedírselo a Claude con la [skill](/docs/skill/) incluida. También puedes [importar diapositivas que diseñaste](/docs/skill/#importar-diapositivas-disenadas) en PowerPoint, Keynote, Google Slides, Canva o Figma.
2. **Ensaya.** Abre `/preview/<id>` para recorrer el deck a solas.
3. **Sal en vivo.** Define un PIN de 4 a 8 dígitos y abre la consola. La primera diapositiva muestra un código QR; los celulares lo escanean e ingresan con un nombre o de forma anónima.
4. **Cierra.** Cuando terminas la sesión puedes descargar un resumen. Luego los datos se eliminan.

## Dos enlaces

- **Enlace del presentador** (privado): la consola, una pantalla para el proyector y un control remoto en el celular. Lleva un token aleatorio largo y te pide tu PIN.
- **Enlace del público** (público): se comparte como el QR de la primera diapositiva.

## Qué puede hacer el público

| Función | Qué pasa |
| --- | --- |
| En vivo / Explorar | Sigue al presentador en tiempo real, o regresa por las diapositivas que ya se mostraron. |
| Quizzes | Resultados en vivo o secretos hasta revelarlos, un ranking opcional, votos con un toque o con el teclado (A–F, 1–6). Los asistentes anónimos reciben un alias creativo. |
| Efectos del puntero | Señalar, enfocar y zoom, reflejados en todas las pantallas. |
| Reacciones y chat | Reacciones flotantes entre el público; chat de texto y/o stickers de GIPHY con moderación. El presentador elige si quiere ver cada uno. |

## Siguientes pasos

- [Inicio rápido](/docs/quick-start/): ejecuta Live Deck en tu computadora.
- [Presentar](/docs/presenting/): vista previa, consola, pantalla y control remoto.
- [Formato del deck](/docs/deck-format/): todos los campos de `deck.json`.

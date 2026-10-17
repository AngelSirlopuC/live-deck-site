<!-- source: site/content/docs/presenting.md sha256:19b4ea7ede7d -->
# Presentar

Un deck se puede abrir de dos formas: una vista previa privada para ensayar y una sesión en vivo para la sala.

## Vista previa vs. sesión en vivo

| | Vista previa | Sesión en vivo |
| --- | --- | --- |
| URL | `/preview/<deck-id>` | `/p/<token>` (consola), `/s/<code>` (público) |
| Quién la ve | Solo tú, en esa pestaña | Todos los que ingresan |
| QR de ingreso | Marcador de posición ("El QR aparece al presentar") | Código real para ingresar |
| Quizzes, chat, reacciones, efectos | Inactivos | Activos |
| Navegación | Flechas, clic o deslizar | La maneja el presentador |

Usa la vista previa para ensayar un deck antes de una charla. Cuando se vea bien, presiona **Presentar** (arriba a la derecha): abre la página de inicio con ese deck ya seleccionado. Define un PIN de 4 a 8 dígitos y abre la consola para empezar la sesión en vivo.

## Superficies del presentador

El enlace del presentador abre tres superficies, todas protegidas por el mismo PIN:

- **Consola** (`/p/<token>`): el monitor de programa, la siguiente diapositiva, las notas, el temporizador, los indicadores del público y de los quizzes, y las teclas de navegación.
- **Pantalla** (`/p/<token>/screen`): la diapositiva limpia para el proyector.
- **Control remoto** (`/p/<token>/remote`): un control remoto en el celular con la diapositiva actual, tus notas y botones grandes de anterior/siguiente.

## El público

Los asistentes escanean el QR de la primera diapositiva e ingresan con un nombre o de forma anónima; los asistentes anónimos reciben un alias creativo.

- **En vivo** sigue al presentador en tiempo real.
- **Explorar** regresa por las diapositivas que ya se mostraron; con un toque vuelves a la diapositiva en vivo.

## Quizzes

Una diapositiva de quiz se abre para votar cuando llegas a ella. Con `display: "live"` las barras se mueven mientras la gente vota; con `display: "secret"` los resultados se mantienen ocultos hasta que los revelas. Los asistentes votan con un toque o con el teclado (A–F, 1–6). Un temporizador opcional cierra la votación, y puedes mostrar un ranking. Consulta [Quizzes](/docs/quizzes/).

## Efectos del puntero

Señalar, enfocar y hacer zoom caen en el mismo punto en todas las pantallas: el proyector y cada celular. Los efectos apuntan a un elemento por su `id`, así que dales ids con significado a los elementos.

## Reacciones y chat

Las reacciones flotan entre el público, al estilo TikTok. El chat acepta texto y/o stickers de GIPHY, con moderación. Nada de lo que hace el público llega al proyector a menos que elijas verlo.

## Terminar una sesión

Las sesiones viven en memoria. Cuando terminas una sesión puedes descargar un resumen; luego los datos se eliminan. Reiniciar el servidor termina todas las sesiones.

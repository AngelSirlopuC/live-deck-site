<!-- source: live-deck/skills/live-deck/references/themes.md sha256:6a6c8cd3893b -->
# Presets de tema

Elige uno con `"theme": { "preset": "<name>" }`. Un preset trae los colores, las fuentes de títulos, de cuerpo y monoespaciada, el fondo por defecto de las diapositivas, el estilo de tarjeta que usa `card: true`, el estilo de los encabezados y la paleta de los gráficos de dona. Los valores exactos están en `shared/themes.ts`; este archivo explica cuándo y cómo usar cada uno.

## Elige en una línea

Decide según el tema, el público y el lugar, y luego escribe una línea: `Preset: <name>, because <topic/audience/venue reason>.`

| Tema / público / lugar | Preset |
| --- | --- |
| Charla técnica, meetup, demo de producto, público mixto | `estudio` |
| Cultura, investigación, humanidades, keynote con una historia | `editorial` |
| Gaming, música, evento juvenil, evento nocturno, auditorio oscuro | `neon` |
| Colegio, taller, comunidad, manualidades, niños y familias | `papel` |
| Diseño, manifiesto, pitch de startup, opinión provocadora | `brutalista` |
| Revisión de negocio, sector público, finanzas, sala iluminada con proyector | `corporativo` |

Para desempatar por el lugar: un proyector en una sala iluminada lava los fondos oscuros y las letras delgadas, así que prefiere `papel` o `corporativo`; un auditorio oscuro o una pantalla LED favorecen `neon` o `estudio`. Cuando la marca del usuario tiene un color, mantén el preset y sobrescribe `accent` (y `background` solo si la marca lo exige).

## estudio

- Personalidad: tranquila, moderna, segura. La opción por defecto segura y con carácter.
- Úsalo para: tecnología, producto, charlas internas, públicos mixtos, lugares desconocidos.
- Evítalo cuando: el tema necesita calidez (niños, comunidad) o una opinión fuerte.
- Tipografía: sans geométrica y limpia para títulos, sans legible para el cuerpo, mono para los antetítulos.
- Composición: fondo oscuro con un degradado suave; tarjetas para agrupar puntos; un solo color de acento para antetítulos y números; anillos o arco de `decor` en una esquina en las aperturas; gráficos de barras en el color de acento.

## editorial

- Personalidad: de revista, reflexiva, literaria.
- Úsalo para: storytelling, resultados de investigación, cultura, historia, keynotes.
- Evítalo cuando: la sala es ruidosa y la charla es rápida; dashboards con muchos datos.
- Tipografía: serif para títulos con tracking cerrado (`tracking: -0.02`), sans para el cuerpo, cursiva para las citas.
- Composición: mucho espacio en blanco, texto alineado a la izquierda en columnas angostas (`w` 0.5–0.6); líneas finas con `shape: "line"` (strokeWidth 2) sobre las secciones; citas grandes con `mark` en una frase; pocas tarjetas; imágenes a sangre completa con `dim` en los separadores de sección.

## neon

- Personalidad: eléctrica, nocturna, enérgica.
- Úsalo para: gaming, música, públicos jóvenes, hackatones, eventos de noche, auditorios oscuros.
- Evítalo cuando: salas iluminadas, temas formales o sensibles, lectura larga.
- Tipografía: títulos gruesos y anchos, a menudo en `uppercase` con tracking abierto (0.05–0.1) en etiquetas cortas.
- Composición: fondo casi negro con un acento brillante; `pattern: "grid"` en los separadores de sección; números grandes en el color de acento; estrella o garabato de `decor` con opacidad baja (0.2–0.4); solo textos cortos.

## papel

- Personalidad: cálida, hecha a mano, amigable.
- Úsalo para: colegios, talleres, charlas comunitarias y de ONG, familias, salas iluminadas.
- Evítalo cuando: el público espera un acabado corporativo o la sala es muy oscura.
- Tipografía: títulos redondeados o humanistas, interlineado holgado (1.3+), mayúscula solo al inicio de la oración.
- Composición: fondo claro de papel con `pattern: "noise"` o `"dots"`; notas con `card: true`; filas de íconos con etiquetas; mancha o garabato de `decor` en el color de acento; los gráficos de dona se leen bien aquí.

## brutalista

- Personalidad: cruda, ruidosa, con opinión.
- Úsalo para: charlas de diseño, manifiestos, pitches, opiniones a contracorriente, decks cortos y contundentes.
- Evítalo cuando: temas sensibles, públicos mayores o formales, explicaciones largas.
- Tipografía: títulos pesados en `uppercase`, tracking cerrado (-0.02 a 0) en tamaños grandes; mono para las etiquetas.
- Composición: tarjetas con borde grueso (`card: true`), sombras duras, colores planos, resaltado amarillo con `mark` en la frase clave, cuadrícula o estrella de `decor`; las cajas asimétricas están bien siempre que la alineación sea intencional.

## corporativo

- Personalidad: clara, confiable, sobria.
- Úsalo para: revisiones de negocio, sector público, finanzas, clientes, salas iluminadas con proyector.
- Evítalo cuando: el objetivo es entretener o provocar.
- Tipografía: sans neutra para títulos, pesos medios (700 en encabezados), sin cuerpo en mayúsculas.
- Composición: fondo claro, acento usado con moderación; los gráficos y las tarjetas de números grandes llevan el contenido; filas de íconos para procesos; como máximo un `decor` (arco o puntos) con opacidad baja en la apertura y el cierre.

## Reglas para todos los presets

- No pongas a mano `background`/`radius` en las tarjetas de texto; usa `card: true` para que decida el preset.
- No mezcles el estilo de distintos presets: un acento, una fuente de títulos y un estilo de tarjeta por deck.
- Primero el contraste: el texto sobre imágenes necesita `dim` >= 0.4; el texto pequeño nunca va sobre la decoración.

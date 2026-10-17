<!-- source: site/content/docs/cli.md sha256:c1777c5bc8c2 -->
# CLI

La CLI `live-deck` crea la estructura, importa, valida y lista decks. No tiene dependencias aparte del proyecto y funciona en Node 24 o superior con TypeScript nativo.

```sh
npm run deck -- <command> [args]
# es lo mismo que
node bin/live-deck.ts <command> [args]
```

## Comandos

| Comando | Qué hace |
| --- | --- |
| `validate <deck.json \| deck-dir \| deck-id>` | Revisa un deck contra el formato v1 y sus recursos. |
| `new <id> [--title "..."]` | Crea `decks/<id>/deck.json` a partir de una plantilla. Se niega a sobrescribir. |
| `import <folder> --id <id> [--title "..."]` | Arma `decks/<id>` a partir de imágenes de diapositivas exportadas desde cualquier herramienta. |
| `list` | Lista los decks con su título y cantidad de diapositivas. |
| `help` | Muestra la ayuda. |

Los ids de los decks usan letras minúsculas, dígitos y guiones, empiezan con una letra o un dígito y tienen como máximo 63 caracteres (`my-talk-2026`). La raíz de los decks es `decks/` en el repositorio; puedes cambiarla con `DECKS_DIR`.

## validate

```sh
npm run deck -- validate my-talk
```

Si todo sale bien, imprime `OK <title> (<n> slides, <q> quizzes)`. Si falla, imprime un problema por línea con el formato `path: message`, donde la ruta apunta a una posición dentro del JSON:

```text
slides.3.elements.1.box: box must stay inside the canvas
slides.2.quiz.correctIndex: correctIndex must point to an option
```

Corrige el valor en esa ruta y vuelve a ejecutarlo. Trata las líneas `warning:` también como defectos. También verifica que exista cada imagen `assets/…` que el deck referencia.

## new

```sh
npm run deck -- new my-talk --title "My talk"
```

Escribe un deck de plantilla con una diapositiva de título (que incluye el `qr` de ingreso) que luego tú o Claude reemplazan.

## import

```sh
npm run deck -- import ./exported --id my-talk --title "My talk"
```

- Acepta archivos `.png`, `.jpg`, `.jpeg` y `.webp` (hasta 200) en orden natural (`slide2` antes que `slide10`).
- Los copia a `decks/<id>/assets/slide-01.<ext>`… como fondos de diapositiva completa y pone el QR de ingreso en la diapositiva 1.
- El título por defecto es el nombre de la carpeta.
- Las imágenes que no son 16:9 se ajustan con franjas (letterbox); una advertencia nombra cada una.
- Se niega con un id existente, un id inválido, una carpeta que no existe o una carpeta sin imágenes compatibles.
- Al final valida el nuevo deck.

## list

```sh
npm run deck -- list
```

Imprime cada deck con su título y cantidad de diapositivas. Puedes ver la vista previa de cualquiera en `/preview/<id>`.

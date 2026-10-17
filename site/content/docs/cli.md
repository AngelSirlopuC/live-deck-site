# CLI

The `live-deck` CLI scaffolds, imports, validates and lists decks. It has no dependencies beyond the project and runs on Node 24 or newer with native TypeScript.

```sh
npm run deck -- <command> [args]
# same as
node bin/live-deck.ts <command> [args]
```

## Commands

| Command | What it does |
| --- | --- |
| `validate <deck.json \| deck-dir \| deck-id>` | Check a deck against format v1 and its assets. |
| `new <id> [--title "..."]` | Scaffold `decks/<id>/deck.json` from a template. Refuses to overwrite. |
| `import <folder> --id <id> [--title "..."]` | Build `decks/<id>` from slide images exported by any tool. |
| `list` | List decks with title and slide count. |
| `help` | Show the help. |

Deck ids are lowercase letters, digits and dashes, starting with a letter or digit, at most 63 characters (`my-talk-2026`). The decks root is `decks/` in the repository; override it with `DECKS_DIR`.

## validate

```sh
npm run deck -- validate my-talk
```

On success it prints `OK <title> (<n> slides, <q> quizzes)`. On failure it prints one issue per line as `path: message`, where the path indexes into the JSON:

```text
slides.3.elements.1.box: box must stay inside the canvas
slides.2.quiz.correctIndex: correctIndex must point to an option
```

Fix the value at that path and run it again. Treat `warning:` lines as defects too. It also checks that every `assets/…` image the deck references exists.

## new

```sh
npm run deck -- new my-talk --title "My talk"
```

Writes a template deck with a title slide (including the join `qr`) that you or Claude then replace.

## import

```sh
npm run deck -- import ./exported --id my-talk --title "My talk"
```

- Takes `.png`, `.jpg`, `.jpeg` and `.webp` files (up to 200) in natural order (`slide2` before `slide10`).
- Copies them to `decks/<id>/assets/slide-01.<ext>`… as full-slide backgrounds and puts the join QR on slide 1.
- The title defaults to the folder name.
- Images that are not 16:9 are letterboxed; a warning names each one.
- Refuses an existing id, an invalid id, a missing folder, or a folder without supported images.
- Ends by validating the new deck.

## list

```sh
npm run deck -- list
```

Prints every deck with its title and slide count. Preview any of them at `/preview/<id>`.

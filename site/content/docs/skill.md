# Claude skill

The `live-deck` skill teaches Claude to turn an idea, outline, notes or pasted .pptx text into a valid `deck.json`, validate it with the CLI and fix every issue.

```sh
npx skills add AngelSirlopuC/live-deck   # installs skills/live-deck
```

Then ask, from the Live Deck repository root:

```text
Create a live deck about safe passwords, in Spanish, with one quiz.
```

## What the skill does

1. **Plans** one idea per slide, 5–25 slides for a normal talk, and one quiz every 4–8 slides when the audience can answer something.
2. **Directs the art**: picks exactly one [theme preset](/docs/themes/) from the topic, audience and venue, and tells you why.
3. **Scaffolds** with `live-deck new <id>` and replaces the template slides, using proven [layout recipes](/docs/layouts/).
4. **Validates** with `live-deck validate <id>` and fixes every printed issue until it prints `OK <title> (<n> slides, <q> quizzes)`.
5. **Hands off** the deck path, the preset and why, the slide and quiz count, and the preview URL.

Deck content (titles, text, notes, quiz questions, alt text) is written in your language.

## Prompts that work

- "Create a live deck about our Q3 launch for the sales team, bright room, 12 slides."
- "Turn these notes into a live deck and add a quiz after each section."
- "Convert this pasted .pptx text into a live deck. Keep my slide titles."
- "Add a secret quiz with a 30-second timer after slide 6."
- "Fix the deck `my-talk`: it fails validation."

## Importing designed slides

Already designed your slides in PowerPoint, Keynote, Google Slides, Canva or Figma? Live Deck keeps your design as images and adds the live layer (join QR, quizzes, chat, reactions, effects).

1. Export one PNG or JPG per slide at 1920×1080 (16:9) into one folder, named so they sort in order (`slide1.png`, `slide2.png`, … sort naturally).
2. Ask Claude to import them, or run the CLI yourself:

   ```sh
   npm run deck -- import ./exported --id my-talk --title "My talk"
   ```

3. Claude looks at every image and writes speaker notes, inserts native quiz slides where they help, and turns slides designed as a question with options into [zone quizzes](/docs/quizzes/#zone-quizzes).
4. Open `/preview/<id>` and check that the dashed zone outlines sit on your designed options. The outlines appear only in the preview, never in a live session.

The join QR is overlaid on slide 1 (bottom-right, white tile). To move it, edit the `qr` element's `box` on slide 1, keeping it at least 0.25 wide and roughly square on screen.

## Other agents

The skill targets Claude, but nothing in the format is Claude-specific: the [deck format](/docs/deck-format/) is documented and the [CLI](/docs/cli/) validates any file, so any agent that can edit files and run a shell can write a deck. See [Agents and MCP](/docs/mcp/) for why there is no MCP server today.

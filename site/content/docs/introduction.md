# Introduction

Live Deck is a live, two-way presentation player. The presenter drives the slides; the audience follows on their phones, answers quizzes, reacts and chats, without installing anything.

Unlike poll tools that sit beside the slides, the slides themselves are the live surface: the deck, the quiz and the presenter's gestures (ripple, focus, zoom) reach every phone in real time, and late or distracted attendees can browse back on their own.

## How a talk works

1. **Write a deck.** A deck is a JSON file at `decks/<id>/deck.json`. The easiest way is to ask Claude with the bundled [skill](/docs/skill/). You can also [import slides you designed](/docs/skill/#importing-designed-slides) in PowerPoint, Keynote, Google Slides, Canva or Figma.
2. **Rehearse.** Open `/preview/<id>` to step through the deck alone.
3. **Go live.** Set a 4–8 digit PIN and open the console. The first slide shows a QR code; phones scan it and join with a first name or anonymously.
4. **Close.** When you end the session you can download a summary. Then the data is deleted.

## Two links

- **Presenter link** (private): the console, a projector screen and a phone remote. It carries a long random token and asks for your PIN.
- **Audience link** (public): shared as the QR on the first slide.

## What the audience can do

| Feature | What happens |
| --- | --- |
| En vivo / Explorar | Follow the presenter in real time, or browse back through the slides already shown. |
| Quizzes | Live results or secret until reveal, an optional leaderboard, votes by tap or keyboard (A–F, 1–6). Anonymous attendees get a creative alias. |
| Pointer effects | Ripple, focus and zoom, mirrored on every screen. |
| Reactions and chat | Floating reactions among the audience; text and/or GIPHY sticker chat with moderation. The presenter opts in to see either. |

## Where to go next

- [Quick start](/docs/quick-start/): run Live Deck on your machine.
- [Presenting](/docs/presenting/): preview, console, screen and remote.
- [Deck format](/docs/deck-format/): every field of `deck.json`.

# Presenting

A deck can be opened two ways: a private preview to rehearse, and a live session for the room.

## Preview vs. live session

| | Preview | Live session |
| --- | --- | --- |
| URL | `/preview/<deck-id>` | `/p/<token>` (console), `/s/<code>` (audience) |
| Who sees it | Only you, in that tab | Everyone who joins |
| Join QR | Placeholder ("El QR aparece al presentar") | Real code to join |
| Quizzes, chat, reactions, effects | Inactive | Active |
| Navigation | Arrows, click or swipe | Driven by the presenter |

Use the preview to rehearse a deck before a talk. When it looks right, press **Presentar** (top right): it opens the home page with that deck preselected. Set a 4–8 digit PIN and open the console to start the live session.

## Presenter surfaces

The presenter link opens three surfaces, all behind the same PIN:

- **Console** (`/p/<token>`): the program monitor, the next slide, notes, the timer, audience and quiz meters, and the transport keys.
- **Screen** (`/p/<token>/screen`): the clean slide for the projector.
- **Remote** (`/p/<token>/remote`): a phone remote with the current slide, your notes and big previous/next keys.

## The audience

Attendees scan the QR on the first slide and join with a first name or anonymously; anonymous attendees get a creative alias.

- **En vivo** follows the presenter in real time.
- **Explorar** browses back through the slides already shown; one tap returns to the live slide.

## Quizzes

A quiz slide opens for votes when you reach it. With `display: "live"` the bars move while people vote; with `display: "secret"` results stay hidden until you reveal. Attendees vote by tap or keyboard (A–F, 1–6). An optional timer closes voting, and you can show a leaderboard. See [Quizzes](/docs/quizzes/).

## Pointer effects

Ripple, focus and zoom land on the same spot on every screen: the projector and every phone. Effects target an element by its `id`, so give elements meaningful ids.

## Reactions and chat

Reactions float among the audience, TikTok style. Chat accepts text and/or GIPHY stickers, with moderation. Nothing the audience does reaches the projector unless you opt in to see it.

## Ending a session

Sessions live in memory. When you end a session you can download a summary; the data is then deleted. Restarting the server ends all sessions.

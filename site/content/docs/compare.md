# Live Deck compared with other tools

Live Deck is an open-source (MIT), self-hosted presentation player in which the slides themselves are the live surface: the audience joins from a phone browser and follows the deck, answers quizzes and sees the presenter's gestures in real time. Poll tools such as Slido, Mentimeter and AhaSlides are hosted services that run alongside your slides, and code-first frameworks such as Slidev and Reveal.js build slides without built-in audience voting. Live Deck sits between the two: one player that shows the deck and runs the audience interaction, on a server you run yourself.

## Live Deck vs poll tools (Slido, Mentimeter, AhaSlides)

Slido, Mentimeter and AhaSlides are audience-interaction services hosted by their vendors. You keep presenting from your usual slide software and open the poll tool next to it, through a separate app or an integration. Live Deck takes the other route: the deck and the interaction are the same thing. Every phone shows the current slide, a quiz is a slide, and pointer effects land on the same spot on the projector and on every phone.

| | Live Deck | Poll tools |
| --- | --- | --- |
| Where it runs | Your server: one Node.js process in one Docker container, no database | Hosted by the vendor |
| How the audience joins | Scans the QR on the first slide and opens it in the phone browser, no app | Through the vendor's join flow |
| What the audience sees | The slides themselves, plus quizzes, reactions and chat | The poll or activity, running alongside your slides |
| Presenter gestures | Ripple (Señalar), focus and zoom, mirrored on every screen | Your slides are shown by separate software |
| Browse back | Explorar mode browses the slides already shown; one tap returns to En vivo | Depends on the tool |
| Data after the session | Sessions live in memory; you can download a summary when you end it, then the data is deleted | Handled by the vendor's service |
| How decks are made | A JSON file, often written by Claude through the [skill](/docs/skill/), or slides exported as images from PowerPoint, Keynote, Google Slides, Canva or Figma and imported | You make slides in your usual software and add polls in the tool |

Because you run Live Deck yourself, limits depend on your server. It is designed for about 200 attendees per session on one small server.

## Live Deck vs slide frameworks (Slidev, Reveal.js, open-slide)

Slidev and Reveal.js are code-first slide frameworks: you write slides in Markdown or HTML and present them in a browser. They are a good fit for developers, but they have no built-in audience voting, so adding live polls means writing your own code. open-slide is a React-based slide framework built for agents. If you like writing slides as code, or asking an agent to write them, Live Deck keeps that workflow: a deck is a JSON file that Claude can write for you, and the live audience features come with it.

| | Live Deck | Slidev / Reveal.js | open-slide |
| --- | --- | --- | --- |
| Authoring | JSON deck, often written by Claude through a skill, or imported slide images | Markdown or HTML | React, built for agents |
| Live audience features | Built in: quizzes (live or secret, timer, leaderboard), reactions, sticker chat, mirrored pointer effects, En vivo / Explorar | No built-in audience voting; you write your own code | See the project's docs |
| Who it's for | Presenters who want the room on their phones, with a deck written by an agent or exported from a design tool | Developers who write slides as code | Teams generating slides with agents |

## Live Deck vs Claper

Claper is an open-source, self-hostable audience-interaction tool, so if self-hosting and open source are what you need, it is a real alternative worth evaluating. The difference is in the shape of the product: Live Deck is the slide player itself. The deck, the quiz and the presenter's gestures reach every phone as one surface, and attendees can browse back through the slides already shown.

## When another tool fits better

Live Deck is not the right choice for every talk:

- **You want a hosted service.** There is no hosted version of Live Deck; you run it yourself. If you don't want a server to look after, a hosted poll tool is simpler.
- **You already present from PowerPoint and only need a poll.** If your slides stay in your usual software and you only want a question or two, a poll tool that runs alongside them asks less of you.
- **You need analytics across sessions.** Live Deck keeps no data after a session: you can download a summary when you end it, then the data is deleted. If you want history and reports over many events, use a tool built for that.
- **You want slides as code without a live audience.** If nobody needs to vote or follow on a phone, Slidev or Reveal.js may be all you need.

## Try it

- [Quick start](/docs/quick-start/): run Live Deck on your machine.
- [Claude skill](/docs/skill/): ask Claude for a deck, or import slides you designed.

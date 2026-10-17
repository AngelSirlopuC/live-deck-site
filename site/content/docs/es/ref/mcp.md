<!-- source: live-deck/skills/live-deck/references/mcp.md sha256:582f3b1e58f8 -->
# Servidor MCP: no hace falta hoy

Decisión: Live Deck no incluye un servidor MCP. Crear decks es trabajo local con archivos: el agente escribe `decks/<id>/deck.json` con sus herramientas de archivos y lo revisa con `node bin/live-deck.ts validate <id>`. La CLI da la misma retroalimentación que daría una herramienta MCP, no necesita un proceso adicional y funciona con cualquier agente que pueda ejecutar una terminal.

## Cuándo se justificaría un servidor MCP

- Los agentes crean o controlan sesiones en vivo en un servidor remoto de Live Deck (iniciar una sesión, avanzar diapositivas, abrir o revelar un quiz, leer resultados) sin acceso a la terminal del servidor.
- Los decks se guardan de forma remota (sin una copia local de `decks/`), así que el agente no puede escribir archivos directamente.
- Un cliente alojado (sin terminal, por ejemplo una app de chat) necesita crear decks.

## Herramientas que expondría

| Herramienta | Propósito |
| --- | --- |
| `validate_deck(deck)` | Devuelve `{ ok, issues[], warnings[] }` para un objeto deck. |
| `save_deck(id, deck)` | Valida y guarda un deck; se niega a sobrescribir sin `overwrite: true`. |
| `list_decks()` | Ids, títulos, cantidad de diapositivas, validez. |
| `upload_asset(id, name, bytes)` | Guarda una imagen en `decks/<id>/assets/`. |
| `create_session(deckId, pin)` | Devuelve las URLs del presentador y del público. |
| `control_session(sessionId, action)` | `next`, `prev`, `goto`, `open_quiz`, `close_quiz`, `reveal`, `end`. |
| `session_summary(sessionId)` | Resultados de los quizzes, ranking, cantidad de reacciones. |

Las herramientas de sesión deben autenticarse con el secreto y el PIN del presentador (las mismas reglas que la URL del presentador) y nunca deben exponer las respuestas de los quizzes ni las notas a quienes llaman con permisos de público.

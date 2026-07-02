# RMR Website — Lessons

_Durable wins, patterns, and lessons learned during this project._

- No-gap background audio across static HTML pages requires same-document soft navigation. Keep `audio.js`, `cursor.js`, and other shared scripts idempotent so page markup can be swapped without restarting persistent UI state.

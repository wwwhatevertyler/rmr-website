# RMR Website — Lessons

_Durable wins, patterns, and lessons learned during this project._

- No-gap background audio across static HTML pages requires same-document soft navigation. Keep shared scripts under `website/scripts/` idempotent so page markup can be swapped without restarting persistent UI state.
- Netlify app domain is `https://rollmyretirement.netlify.app`. Keep deployment/domain details in `docs/project/deployment.md` so agents do not have to infer the Netlify target from GitHub or local state.
- Persistent shared scripts that bind document-level interactions should use named handlers and refresh them in `ensureMounted()`; boolean "already attached" flags can drift after soft navigation and leave click/audio behavior stale.

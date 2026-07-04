# Content System

`DESIGN.md` is the canonical content and voice reference. This file summarizes current page messaging.

## Voice

RMR copy should be calm, plain-spoken, and specific. It explains rollover decisions without pressure or jargon.

Use:

- concrete financial language
- short claims with proof nearby
- human reassurance
- editorial headings

Avoid:

- generic startup claims
- urgent scare tactics
- "elevate," "seamless," "unleash," "next-gen"
- overexplaining obvious UI behavior

## Homepage

Primary promise: help people take control of old 401(k)s and retirement funds by connecting them with a trusted network of vetted financial professionals.

Key supporting points:

- Free to you.
- No obligation.
- Real humans are available.
- Trusted advisor network in your area.
- Three-step process: get matched, understand options, meet/evaluate advisors.

## Advisor Page

Primary promise: a selective advisor network built around rollover opportunities.

Key supporting points:

- pre-screened individuals
- limited metro availability
- 7-day opportunity window
- quality and compliance standards
- application review before acceptance

## Contact Page

Primary promise: tell RMR enough context to match you with the right local advisor and follow up quickly.

Selector language should stay practical:

- Starting a rollover
- Have old 401(k)s
- Just exploring options
- Something else

## Blog

Tone: practical retirement perspective for people who want to understand their money instead of worry about it.

Current categories:

- Rollover Strategy
- Planning Tips
- Market Updates

Content lives in `website/data/blog/posts.json` and is emitted to `dist/blog/posts.json`. Blog images and article cover crops are part of the editorial system, not decoration.

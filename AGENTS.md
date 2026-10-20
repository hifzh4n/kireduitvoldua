# AGENTS.md

## Agent skills

### Issue tracker

Local markdown in `.scratch/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/domain.md`.

## Engineering Principles

- **No AI Slop**: Clean, handcrafted UX and design. Avoid generic AI aesthetics (meaningless purple gradients, floaty glow cards, placeholder-heavy UI, robotic copy).
- **Disciplined Flow**: Design decisions are resolved through structured questioning (`/grill-me` / `/grill-with-docs`) and captured in `GLOSSARY.md` and ADRs before tickets and implementation.
- **TDD & High Quality**: Type-safe Next.js with verified red-green-refactor loop.

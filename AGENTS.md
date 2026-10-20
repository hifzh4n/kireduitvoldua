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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

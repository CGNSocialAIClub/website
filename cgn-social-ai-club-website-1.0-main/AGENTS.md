# CGN Social AI Website Instructions

## Scope

Applies to the website repository.

## Commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Deploy: `npm run deploy`

## Working Notes

- `npm run build` includes `prebuild` sitemap generation and `postbuild` route-specific HTML generation.
- Deploy uses Wrangler assets with `dist/`.
- Prefer edits in `src/`, `public/`, and `scripts/`; do not hand-edit generated output in `dist/`.

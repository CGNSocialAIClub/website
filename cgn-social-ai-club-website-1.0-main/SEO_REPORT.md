# SEO Report. TUM Social AI Club Website

Date: 2026-02-18

## Phase A. Discovery

### Stack and platform
- Framework: React 19 with Vite 7.
- Routing: `react-router-dom` with `BrowserRouter`.
- Rendering model: Client Side Rendering. No SSR or SSG.
- Deployment target: Cloudflare via Wrangler assets SPA fallback.
- Build pipeline: `npm run build` using Vite.

### Public routes inventory

| URL path | Current title | Current H1 | Indexability |
| --- | --- | --- | --- |
| `/` | `Home | TUM Social AI Club` | `TUM Social AI Club: AI for social good projects with nonprofits` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/` |
| `/community` | `Our Community | TUM Social AI Club` | `Get to Know Our Departments` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/community` |
| `/social-partners` | `Nonprofits & Project Partners | TUM Social AI Club` | `Let's Build AI Solutions for Your Mission` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/social-partners` |
| `/sponsors` | `Partners | TUM Social AI Club` | `Empower Tomorrow's AI Leaders` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/sponsors` |
| `/contact` | `Contact | TUM Social AI Club` | `Let's Connect` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/contact` |
| `/application` | `Application | TUM Social AI Club` | `Applications Are Currently Closed` or `Applications Are Now Open!` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/application` |
| `/privacy` | `Privacy Policy | TUM Social AI Club` | `Datenschutzerklärung` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/privacy` |
| `/imprint` | `Imprint | TUM Social AI Club` | `Impressum` | Indexable. `robots=index,follow`. Canonical `https://tum-socialaiclub.de/imprint` |
| `*` not found route | `Page Not Found | TUM Social AI Club` | `Lost in AI?` | Non indexable. `robots=noindex,nofollow`. Canonical `https://tum-socialaiclub.de/<unknown-path>` |

### Existing SEO infrastructure
- `robots.txt`: missing before. now present at `public/robots.txt`.
- `sitemap.xml`: existed before. updated with `lastmod` for all URLs.
- Meta management: `src/components/ui/Seo.jsx` updates title and meta tags.
- Canonical handling: missing before. now centralized in `Seo` component.
- Structured data: missing before. now `Organization` on home and `BreadcrumbList` on subpages.
- Breadcrumb component: missing before. now `src/components/ui/Breadcrumbs.jsx` in layout.
- Analytics: no analytics scripts detected. Privacy policy states no tracking tools.
- Internal navigation: header and footer links exist as real anchor links via `Link` and `a` tags.

## Phase B. Diagnosis

### P0 issues
1. Missing `robots.txt`.
- Cause: no crawler policy file in `public/`.
- Impact: weaker crawl guidance and no explicit sitemap discovery from robots endpoint.
- Status: fixed.

2. Robots meta leakage risk after navigating from 404.
- Cause: `Seo` only set `noindex` when true but did not reliably reset on other routes.
- Impact: important pages could remain non indexable in SPA session.
- Status: fixed.

3. Canonical tags missing across pages.
- Cause: `Seo` component did not emit canonical link.
- Impact: duplicate URL interpretation risk.
- Status: fixed.

### P1 issues
1. Multiple `h1` tags on several pages.
- Cause: reusable `HeadingSection` always rendered `h1`.
- Impact: weaker page intent clarity.
- Status: fixed.

2. No breadcrumb UI and no breadcrumb schema.
- Cause: missing breadcrumb component and JSON LD generation.
- Impact: weaker site hierarchy understanding by Google.
- Status: fixed.

3. Structured data missing on homepage.
- Cause: no `Organization` JSON LD.
- Impact: weaker entity understanding.
- Status: fixed.

4. Internal linking to core intent pages not explicit enough for sitelink signaling.
- Cause: header footer did not consistently expose About. Projects. Events. Join. Partners. Contact.
- Impact: weaker navigational graph.
- Status: fixed.

### P2 issues
1. CSR only architecture limits deterministic metadata in raw HTML for bots.
- Cause: no SSR or pre-render.
- Impact: some crawlers process slower and less reliably than fully pre-rendered pages.
- Status: open.

2. Sitemap was static and manually maintained.
- Cause: no generation step from route source.
- Impact: future route drift risk.
- Status: fixed with prebuild sitemap generation.

3. Large JS bundle warning in production build.
- Cause: main chunk above 500 kB.
- Impact: slower first load for users and potential crawl budget inefficiency.
- Status: open.

## Phase C. Implemented changes

### Core SEO infra
- Added `public/robots.txt` with full allow and sitemap pointer.
- Added automated sitemap generation in `scripts/generate-sitemap.mjs`.
- Updated build pipeline with `generate:sitemap` and `prebuild` in `package.json`.
- Updated base `index.html` canonical, robots, and production OG/Twitter URLs.

### Meta, canonical, schema
- Extended `src/components/ui/Seo.jsx`:
  - canonical generation per path.
  - explicit robots handling for indexable and non indexable routes.
  - `BreadcrumbList` JSON LD generation on subpages.
  - support for extra `structuredData` payloads.
- Added route and canonical helpers in `src/utils/seoRoutes.js`.
- Added home `Organization` schema in `src/App.jsx`.

### Breadcrumbs and content structure
- Added semantic breadcrumb UI `src/components/ui/Breadcrumbs.jsx` and wired into layout.
- Updated `HeadingSection` to support configurable heading level.
- Ensured one clear `h1` per page by setting hero headers to `h1` and section headers to `h2`.
- Added explicit home `h1` in hero section for semantic clarity.

### Internal linking and navigation
- Expanded header and footer links to strongly surface About. Projects. Events. Join. Partners. Contact.
- Added `id="events"` section anchor for internal linking target.

## Phase D. Verification

### Local checks
- Build: passed. `npm run build`.
- Tests: not available. `npm run test` script missing.
- Lint: not available. `npm run lint` script missing.

### Fixed issues summary
- P0 fixed: robots.txt, canonical, robots meta leakage.
- P1 fixed: heading hierarchy, breadcrumb UI and schema, organization schema, stronger core internal links.

### Open issues
- CSR only metadata delivery in initial HTML remains a structural limitation.
- No automatic sitemap generation pipeline.
- Bundle size warning from Vite.

### Manual steps. Google Search Console
1. Add and verify property `https://tum-socialaiclub.de`.
2. Submit sitemap `https://tum-socialaiclub.de/sitemap.xml`.
3. Run URL Inspection and Request Indexing for core URLs.
4. Monitor Coverage and Enhancements for Breadcrumb and Rich Result processing.

### URLs to test in Search Console
- `https://tum-socialaiclub.de/`
- `https://tum-socialaiclub.de/community`
- `https://tum-socialaiclub.de/social-partners`
- `https://tum-socialaiclub.de/sponsors`
- `https://tum-socialaiclub.de/contact`
- `https://tum-socialaiclub.de/application`
- `https://tum-socialaiclub.de/privacy`
- `https://tum-socialaiclub.de/imprint`

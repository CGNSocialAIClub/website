# GEO Report. CGN Social AI Club

Date: 2026-02-18

## 1. Discovery Ergebnisse

### 1.1 Stack. Routing. Rendering. Deployment
- Framework: React 19 with Vite 7
- Routing: `react-router-dom` with `BrowserRouter`
- Rendering: Client Side Rendering SPA
- Deployment: Cloudflare via Wrangler assets deploy with SPA fallback
- Build pipeline: `npm run build` with `prebuild` sitemap generation

### 1.2 Öffentliche Routen und Templates

| URL | Current Title | Current H1 | Meta Robots | Canonical |
| --- | --- | --- | --- | --- |
| `/` | `Germanys First AI for Good Student Club in Cologne | CGN Social AI Club` | `CGN Social AI Club: AI for social good projects with nonprofits` | `index, follow` | yes |
| `/community` | `Student AI Community at CGN Cologne | CGN Social AI Club` | `Get to Know Our Departments` | `index, follow` | yes |
| `/social-partners` | `AI Projects for Nonprofits and NGOs | CGN Social AI Club` | `Let's Build AI Solutions for Your Mission` | `index, follow` | yes |
| `/sponsors` | `Partner with CGN Social AI Club | CGN Social AI Club` | `Empower Tomorrow's AI Leaders` | `index, follow` | yes |
| `/contact` | `Contact CGN Social AI Club Cologne | CGN Social AI Club` | `Let's Connect` | `index, follow` | yes |
| `/application` | `Join CGN Social AI Club | CGN Social AI Club` | `Applications Are Currently Closed` or `Applications Are Now Open!` | `index, follow` | yes |
| `/privacy` | `Privacy Policy | CGN Social AI Club` | `Datenschutzerklärung` | `index, follow` | yes |
| `/imprint` | `Imprint and Legal Notice | CGN Social AI Club` | `Impressum` | `index, follow` | yes |
| `*` not found | `Page Not Found | CGN Social AI Club` | `Lost in AI?` | `noindex, nofollow` | yes |

### 1.3 Echte Selbstbeschreibung aus Website und Repo
Mission und Positionierung aus Originalinhalten:
- Student initiative focused on AI for good.
- Practical AI and ML projects with nonprofits and social organizations.
- Social and environmental impact focus.
- Community and student development focus at CGN.
- Germany context with Cologne origin and reach beyond local scope.

Angebote und Aktivitäten aus bestehenden Inhalten:
- Semester projects with nonprofit partners.
- Engineering. social partnerships. operations and community tracks.
- Member journey with mentorship and community events.
- Collaboration for nonprofits and partner sponsorship.

Tatsächlich verwendete Kernbegriffe:
- AI for good
- Artificial Intelligence
- Machine Learning
- nonprofit and NGO collaboration
- social impact
- environmental impact
- student initiative
- CGN. Cologne. Germany

Externe Profile und offizielle Kontaktpunkte:
- LinkedIn: `https://www.linkedin.com/company/cgnsocialaiclub`
- Website: `https://cgn-socialaiclub.de`
- Contact: `contact@cgn-socialaiclub.de`

### 1.4 Mehrsprachigkeit
- Keine getrennten Sprachversionen oder locale Routen.
- Hauptseiten sind überwiegend Englisch.
- Rechtliche Seiten enthalten Deutsch.
- `hreflang` für mehrere URL Sprachversionen aktuell nicht relevant.

## 2. GEO Audit. P0. P1. P2

### P0
1. Problem: LLM Orientierung im Root fehlte.
- Lösung: `llms.txt` plus `ai.txt` Hinweis ergänzen.
- Wo im Code: `public/llms.txt`, `public/ai.txt`
- Risiko: sehr gering
- Wie testen: `curl https://cgn-socialaiclub.de/llms.txt` und `curl https://cgn-socialaiclub.de/ai.txt`

2. Problem: Entity Kontext war vorhanden aber zu knapp für generative Zitierbarkeit.
- Lösung: Organization JSON LD um affiliation context, location, areaServed, topical focus erweitern.
- Wo im Code: `src/App.jsx`
- Risiko: gering. semantisch konservativ gehalten
- Wie testen: Rich Results Test. Schema Validator

### P1
1. Problem: Title und Description waren teilweise generisch und nicht konsistent GEO orientiert.
- Lösung: Route spezifische Patterns mit CGN. Cologne. AI for good. nonprofit and impact Kontext.
- Wo im Code: `src/App.jsx`, `src/pages/*.jsx`
- Risiko: gering
- Wie testen: per route in `<head>` prüfen und via URL Inspection snippets prüfen

2. Problem: OG und Twitter Felder waren nicht vollständig konsistent für citations and shares.
- Lösung: `og:site_name`, `og:locale`, `twitter:url` ergänzen.
- Wo im Code: `src/components/ui/Seo.jsx`, `index.html`
- Risiko: gering
- Wie testen: OpenGraph Debugger. page source checks

3. Problem: Canonical and robots stability muss für SPA Routen robust bleiben.
- Lösung: bestehende Canonical und robots Logik beibehalten und validieren.
- Wo im Code: `src/components/ui/Seo.jsx`
- Risiko: gering
- Wie testen: route changes in browser. head inspection

### P2
1. Problem: Canonical host and https redirects sind nicht im Repo codiert.
- Lösung: Cloudflare Redirect Rule für `www -> apex` und Always Use HTTPS aktivieren.
- Wo: Cloudflare Dashboard. not in codebase
- Risiko: mittel bei Fehlkonfiguration
- Wie testen: `http://` and `https://www.` requests müssen 301 zur canonical URL liefern

2. Problem: Kein Consent Mechanismus für Analytics sichtbar.
- Lösung: Analytics nur nach vorhandenem Consent Layer integrieren. aktuell nur Vorschlag.
- Wo: future infra decision
- Risiko: hoch rechtlich ohne Consent
- Wie testen: Consent logs plus privacy compliance review

## 3. Vorschläge zuerst

### 3.1 Empfohlenes Title und Description Pattern
- Pattern: `[Page Intent with Entity Context] | CGN Social AI Club`
- Description pattern: `Who we are + what we do + where + why relevant`

Empfohlene Route Patterns:
- `/`: Germanys First AI for Good Student Club in Cologne
- `/community`: Student AI Community at CGN Cologne
- `/social-partners`: AI Projects for Nonprofits and NGOs
- `/sponsors`: Partner with CGN Social AI Club
- `/contact`: Contact CGN Social AI Club Cologne
- `/application`: Join CGN Social AI Club

### 3.2 Empfohlenes Organization JSON LD
- Type: `NonprofitOrganization`
- Name plus alternateName
- URL. logo. email
- Affiliation context: Technical University of Cologne
- Founding location signal: Cologne, Germany
- areaServed: Germany
- sameAs: LinkedIn
- knowsAbout: AI for good and impact topics

### 3.3 Empfohlene robots und sitemap Struktur
- `robots.txt` with global allow and sitemap location.
- sitemap from build step with all indexable routes and fresh `lastmod`.

### 3.4 Empfohlenes llms.txt Inhaltsgerüst
- Entity summary
- core topics
- key URLs
- official profiles
- contact
- canonical domain guidance
- anti fabrication note for assistants

### 3.5 Empfohlene Redirect und Canonical Regeln
- 301 `http -> https`
- 301 `www -> apex`
- canonical host always `https://cgn-socialaiclub.de`
- trailing slash normalization by canonical tags already present

## 4. Umsetzung. Nur technische unsichtbare Maßnahmen

### Implementiert
1. Enhanced structured data for GEO entity clarity.
- File: `src/App.jsx`
- Added richer `NonprofitOrganization` JSON LD and `WebSite` JSON LD.

2. Improved per page title and meta description patterns.
- Files:
  - `src/App.jsx`
  - `src/pages/CommunityPage.jsx`
  - `src/pages/SocialPartnersPage.jsx`
  - `src/pages/SponsorsPage.jsx`
  - `src/pages/ContactPage.jsx`
  - `src/pages/ApplicationPage.jsx`
  - `src/pages/Imprint.jsx`
  - `src/pages/PrivacyPolicy.jsx`

3. Strengthened OG and Twitter meta consistency.
- Files:
  - `src/components/ui/Seo.jsx`
  - `index.html`

4. Added LLM orientation files.
- Files:
  - `public/llms.txt`
  - `public/ai.txt`

### Bereits vorhanden und validiert
- canonical per route in SEO layer
- robots meta handling with noindex on not found
- robots.txt
- sitemap generation pipeline and output

### Nur vorgeschlagen. nicht implementiert
- host redirects and https enforcement via Cloudflare rules in dashboard
- analytics integration without consent mechanism

## 5. Verifikation und Checks

### 5.1 Lokale Checks
- `npm run build`: passed
- `npm run lint`: script missing in project
- `npm run test`: script missing in project

### 5.2 JSON LD und Snippet Tests
1. Rich Results Test
- Test `https://cgn-socialaiclub.de/`
- Validate Organization and WebSite schema

2. Schema validation
- Confirm `BreadcrumbList` on subpages
- Confirm no schema errors

3. Search Console
- Property for `https://cgn-socialaiclub.de`
- Submit sitemap `https://cgn-socialaiclub.de/sitemap.xml`
- URL Inspection and Request indexing for key routes

### 5.3 Key URLs zum Testen
- `https://cgn-socialaiclub.de/`
- `https://cgn-socialaiclub.de/community`
- `https://cgn-socialaiclub.de/social-partners`
- `https://cgn-socialaiclub.de/sponsors`
- `https://cgn-socialaiclub.de/contact`
- `https://cgn-socialaiclub.de/application`
- `https://cgn-socialaiclub.de/privacy`
- `https://cgn-socialaiclub.de/imprint`
- `https://cgn-socialaiclub.de/llms.txt`
- `https://cgn-socialaiclub.de/ai.txt`

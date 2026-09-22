# CGN Social AI Club — Website

The official website of **CGN Social AI Club e.V.**, live at **https://cologne-socialaiclub.de**.

This README is written for whoever maintains the site next. You don't need to be a React expert: most day-to-day changes (adding a member, a project, or changing text) mean editing a JSON or JS file and pushing to `main`.

---

## Contents

1. [Quick start](#1-quick-start)
2. [How the site works](#2-how-the-site-works)
3. [Folder structure](#3-folder-structure)
4. [Common tasks](#4-common-tasks)
5. [Deployment and hosting](#5-deployment-and-hosting)
6. [Gotchas](#6-gotchas)
7. [Handover checklist](#7-handover-checklist)

---

## 1. Quick start

You need **Node.js 20 or newer** (check with `node -v`) and git.

```sh
git clone https://github.com/CGNSocialAIClub/website.git
cd website/cgn-social-ai-club-website-1.0-main   # all code lives in this subfolder
npm install
npm run dev                                      # opens http://localhost:5173
```

The dev server reloads the page as soon as you save a file.

Before you push, always run a production build and make sure it succeeds:

```sh
npm run build     # builds into dist/
npm run preview   # serves the built site locally to check it
```

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Generates `public/sitemap.xml`, builds the site into `dist/`, then writes an HTML file per route with the right SEO tags |
| `npm run preview` | Serves `dist/` locally |
| `npm run cf:dev` | Serves `dist/` with the real Cloudflare runtime (run `build` first) |
| `npm run deploy` | Builds and deploys manually to Cloudflare (normally not needed, see [section 5](#5-deployment-and-hosting)) |

---

## 2. How the site works

- **React 19 + Vite 7**, styled with **Tailwind CSS 4**. Animations use Framer Motion.
- It is a **single-page app**: routing happens in the browser with React Router. All routes are defined in [`src/main.jsx`](cgn-social-ai-club-website-1.0-main/src/main.jsx).
- **No backend and no database.** All content (team, projects, texts) lives in files in this repo. The site updates when someone changes those files and pushes.
- **Two languages, English and German.** Every visible text lives in [`src/i18n/translations.js`](cgn-social-ai-club-website-1.0-main/src/i18n/translations.js). Visitors switch language with the toggle in the footer.
- **Light and dark mode.** Colours come from CSS variables in [`src/index.css`](cgn-social-ai-club-website-1.0-main/src/index.css) (e.g. `var(--text-primary)`). Use those variables instead of hard-coded colours so both themes keep working.
- **Hosting:** Cloudflare Workers serves the static files from `dist/`. See [section 5](#5-deployment-and-hosting).

### Pages

| URL | File |
|---|---|
| `/` | `src/App.jsx` (homepage, made of sections from `src/components/sections/`) |
| `/projects` | `src/pages/ProjectsPage.jsx` |
| `/team` | `src/pages/CommunityPage.jsx` |
| `/social-partners` | `src/pages/SocialPartnersPage.jsx` |
| `/sponsors` | `src/pages/SponsorsPage.jsx` |
| `/contact` | `src/pages/ContactPage.jsx` |
| `/application` | `src/pages/ApplicationPage.jsx` |
| `/privacy`, `/imprint` | `src/pages/PrivacyPolicy.jsx`, `src/pages/Imprint.jsx` |
| any unknown URL | `src/pages/NotFound.jsx` (404 page) |
| `/logo-test` | `src/pages/LogoAnimationTest.jsx`, an internal test page that isn't linked anywhere |

---

## 3. Folder structure

Everything below is inside `cgn-social-ai-club-website-1.0-main/`.

```
src/
  main.jsx            Entry point + all routes
  App.jsx             Homepage (which sections show, in what order)
  pages/              One file per page
  layout/             Navbar, Footer, Layout wrapper
  components/
    sections/         Big homepage/page blocks (Hero, About, Projects, Sponsors…)
    cards/            Team member, project, partner cards
    ui/               Small reusable pieces (Button, Logo, Seo, toggles…)
  data/
    team.json         ← team members
    projects.json     ← projects
  i18n/
    translations.js   ← ALL visible texts, English + German
  config/
    features.js       ← on/off switches (project detail pop-ups, announcement pop-up)
  utils/
    cms.js            Loads team/projects, holds the German project texts
    seoConfig.js      ← page titles/descriptions for Google + the site URL
public/               Files served as-is (images, logos, favicon, robots.txt, llms.txt)
  cms/team/           ← member photos
  cms/projects/       ← project images
  cms/all-partner-logos/, cms/strategic-partner-logos/   ← partner and sponsor logos
  assets/             Club logos, icons, social media icons
scripts/              Build helpers (sitemap + per-route HTML). You rarely need to touch these.
wrangler.jsonc        Cloudflare config
dist/                 Build output. Generated, never edit by hand, not committed.
api/                  Unused Express stub, not deployed
```

---

## 4. Common tasks

After any change, check it with `npm run dev`, run `npm run build`, then commit and push to `main`. The live site updates automatically within a few minutes.

### Add, change, or remove a team member

1. Put the photo in `public/cms/team/`. Use a plain filename **without spaces or umlauts**, e.g. `Max_Mustermann.jpg` (see [Gotchas](#6-gotchas)). A square-ish portrait of about 800px is plenty.
2. Add an entry to [`src/data/team.json`](cgn-social-ai-club-website-1.0-main/src/data/team.json):

```json
{
  "id": "maxmustermann",
  "name": "Max Mustermann",
  "role": "Member",
  "department": "Engineering",
  "image": "/cms/team/Max_Mustermann.jpg",
  "linkedin": "https://www.linkedin.com/in/...",
  "github": "",
  "email": "",
  "zoom": 1,
  "offsetX": 0,
  "offsetY": 0,
  "status": "active member"
}
```

| Field | Notes |
|---|---|
| `id` | Unique, lowercase, no spaces. Projects refer to it via `authorId`. |
| `role` | `Member`, `Team Lead`, or a board title such as `Head of Strategy`. Team Leads are shown before members. |
| `department` | One of: `Management Board`, `Advisory`, `Engineering`, `Social Partnerships`, `Strategic Partnerships`, `Community`, `Marketing`, `Finance Legal Admin`. Spell it exactly like this: the department names, icons and descriptions are keyed on the string. |
| `zoom`, `offsetX`, `offsetY` | Adjust the photo crop if a face is cut off. Offsets go from `-100` to `100`, and `0` is centred (e.g. `offsetY: -40` moves the crop up). `zoom` above `1` zooms in. |
| `status` | Only `"active member"` is shown. To remove someone without deleting the entry, change the status (e.g. `"alumni"`). |

The order of the board is set by the `roleOrder` list in [`src/pages/CommunityPage.jsx`](cgn-social-ai-club-website-1.0-main/src/pages/CommunityPage.jsx). If board titles change, update that list too.

### Add a project

1. Put the image in `public/cms/projects/`.
2. Add an entry to [`src/data/projects.json`](cgn-social-ai-club-website-1.0-main/src/data/projects.json):

```json
{
  "id": "6",
  "title": "Project Title",
  "description": "Short text for the card",
  "content": "## Heading\n\nLong article text in **Markdown**.",
  "hasArticle": true,
  "tags": ["Tag1", "Tag2"],
  "image": "/cms/projects/my-project.png",
  "isLogo": false,
  "status": "Active",
  "partner": "Partner Name",
  "authorId": "maxmustermann",
  "date": "October 2026"
}
```

- `hasArticle: true` makes the card clickable and opens `content` in a pop-up. Leave it out if there is no article yet.
- `status` is `Active` or `Upcoming`.
- `isLogo: true` shows the image smaller and uncropped, which suits logos. Use `false` for photos.
- **German version:** `projects.json` holds the English text. The German title, description, content, tags, status and date go into the `localizedProjects.de` object in [`src/utils/cms.js`](cgn-social-ai-club-website-1.0-main/src/utils/cms.js), keyed by the same `id`. Without an entry there, German visitors see the English text.

### Change any text on the site

Search for the text in [`src/i18n/translations.js`](cgn-social-ai-club-website-1.0-main/src/i18n/translations.js). The file has an `en: { … }` block and a `de: { … }` block with the same structure, so **always change both languages**. If you add a new key, add it to both blocks or one language shows nothing.

Legal pages (privacy, imprint) have their text directly inside their page files.

### Nonprofit partners, sponsors, partner logo strip

| What | Where to edit | Logos go in |
|---|---|---|
| Nonprofit partner cards (`/social-partners`) | `socialPartners` array in `src/pages/SocialPartnersPage.jsx` | `public/cms/all-partner-logos/` |
| Sponsors / supporters (homepage + `/sponsors`) | `partners` array in `src/components/sections/SponsorsSection.jsx`. Entries are commented out until real partners are confirmed; uncomment or copy the pattern. `tier` is `gold`, `silver`, `bronze` or `supporter`. Give a `logoDark` for dark mode. | `public/cms/strategic-partner-logos/<tier>/` |
| Scrolling logo strip on homepage | `logos` array in `src/components/ui/PartnerMarquee.jsx`. It is currently **switched off** in `src/App.jsx`; remove the comment around `<PartnerMarquee />` to show it. | `public/cms/all-partner-logos/` |

### Show or hide homepage sections

[`src/App.jsx`](cgn-social-ai-club-website-1.0-main/src/App.jsx) lists the homepage sections in order. Reorder, comment out or add sections there. The team photo section and the partner marquee are commented out for now and can be re-enabled once there is a good photo or confirmed partners.

### Feature switches

[`src/config/features.js`](cgn-social-ai-club-website-1.0-main/src/config/features.js):

- `PROJECT_DETAILS_ENABLED`: turns project article pop-ups on or off.
- `RECRUITING`: the recruiting banner on the homepage (see below). `bannerEnabled` shows or hides it, and `applicationsOpenAt` is the moment the site switches from "Applications open on …" to "Apply now".
- `SITE_POPUP`: an announcement pop-up on the application page, useful for recruiting deadlines. Set `enabled: true` and fill in `body`, `ctaLabel` and `ctaHref`. Change `storageKey` for each new announcement, because visitors who dismissed the old one won't see a popup with the same key again.

### Recruiting banner (each semester)

The banner below the homepage hero is `src/components/sections/RecruitingBanner.jsx`. Before the date in `RECRUITING.applicationsOpenAt` (in `src/config/features.js`), it says "Applications open on …" with a "See what to expect" button. The application page then says "Applications open on …" and hides the application-form button. From that date on, both switch to "Apply now" automatically, with no deploy needed.

For a new semester:
1. Set the new date in `RECRUITING.applicationsOpenAt`.
2. Update the texts under `home.recruiting` (kicker, title, texts, buttons) and `pages.application.statusTitleBefore` / `statusSubtitleBefore` in `translations.js`, in **both** languages. Keep ` ` between the day and the month (e.g. `1 October`) so the date never breaks across two lines.
3. To change the artwork, replace `public/assets/banners/recruiting-light.webp` and `recruiting-dark.webp`. Keep the same format: 3:1, left half empty for the text, same background colours as the site (white / `#0A2D57`). The dark image appears automatically in dark mode.
4. To remove the banner after recruiting, set `bannerEnabled: false`.

### Change contact email or social links

The email `contact@cologne-socialaiclub.de` is written directly in several files (Footer, ContactPage, App.jsx, translations). Search the `src/` folder for it and replace every occurrence.

### Add a new page

1. Create `src/pages/MyPage.jsx`. Copying an existing simple page such as `ContactPage.jsx` is the easiest start.
2. Add a `<Route>` in `src/main.jsx`. Also add the path to `navOrder` there so the slide animation goes the right way.
3. Link it from `src/layout/Navbar.jsx` and/or `src/layout/Footer.jsx`, and add the link label to both languages in `translations.js`.
4. Add an entry to `ROUTE_SEO` in `src/utils/seoConfig.js` (title and description). The sitemap and the per-page HTML for Google are generated from this list on every build.
5. Optionally add a label in `ROUTE_LABELS` in `src/utils/seoRoutes.js` (used for breadcrumbs).

### SEO and AI-search files

- Page titles and descriptions for Google are in `src/utils/seoConfig.js`, not in the page files.
- `public/sitemap.xml` is **generated automatically** on build. Don't edit it by hand, and don't worry when it shows up as changed in git (the date inside changes).
- `public/robots.txt`, `public/llms.txt`, `public/ai.txt` are hand-written facts about the club for search engines and AI assistants. Update `llms.txt` when important facts change (founding info, focus, contact).
- `SEO_REPORT.md` and `GEO_REPORT.md` are older audit notes, kept for reference.

---

## 5. Deployment and hosting

| Piece | Where |
|---|---|
| Code | GitHub: `CGNSocialAIClub/website`, branch `main` |
| Hosting | Cloudflare Workers (static assets), configured in `wrangler.jsonc` |
| Domain | `cologne-socialaiclub.de`, connected in Cloudflare under the Worker's **Settings → Domains & Routes** |

**Normal workflow:** push to `main`, then Cloudflare builds and deploys automatically. In the Cloudflare dashboard (**Workers & Pages → the website Worker**) the Git connection is set up with:

- Root directory: `cgn-social-ai-club-website-1.0-main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

If a deploy fails, open the Worker in the Cloudflare dashboard, go to **Deployments**, and read the build log. Usually the same error also shows up locally with `npm run build`.

**Manual deploy** (only if the automatic one is broken): run `npx wrangler login` once, then `npm run deploy`.

**Rolling back:** in Cloudflare under **Deployments** you can roll back to any earlier version in one click. Alternatively, `git revert` the bad commit and push.

**Unknown URLs:** `wrangler.jsonc` sets `not_found_handling: "single-page-application"`, so every unknown path loads the app and React shows the 404 page. Don't remove that setting, or reloading any page other than `/` will break.

---

## 6. Gotchas

- **Filenames:** use only letters, numbers, `-` and `_` for images. Spaces and umlauts (`ä`, `ü`, `é`) have broken photos before, because macOS and Linux encode them differently. Paths are also **case-sensitive** on the server: `Photo.JPG` ≠ `photo.jpg`, even if it works on your Mac.
- **Images must live in `public/`** and are referenced from the site root, without `public`: the file `public/cms/team/x.jpg` is referenced as `/cms/team/x.jpg`.
- **Never edit `dist/`.** It is overwritten on every build.
- **Hard-coded names:** `src/pages/CommunityPage.jsx` has special ordering for specific people (e.g. `Karthik Gudibanda`, `Nikita Zubairov`). If those people leave or the ordering logic confuses you, that's where it lives.
- **Both languages:** most "text is missing" bugs come from a key added to `en` but not `de`, or the other way round.
- **`.DS_Store`** files are macOS junk and are git-ignored. Don't commit them.
- **Unused bits:** `api/server.js` and the `express`/`cors`/`body-parser` dependencies are leftovers and aren't used by the website. It's safe to remove them if you're cleaning up.

---

## 7. Handover checklist

When the person responsible for the website changes, make sure the new person has:

- [ ] Admin or write access to the GitHub organisation **CGNSocialAIClub**
- [ ] Access to the club's **Cloudflare account** (hosting + domain settings)
- [ ] Access to wherever the **domain `cologne-socialaiclub.de`** is registered, and knows when it renews
- [ ] Access to the **contact@cologne-socialaiclub.de** mailbox, if they handle website enquiries
- [ ] Read this README and done one small test change end-to-end (edit, build, push, check the live site)

Store the account credentials in the club's shared password manager, not in a personal account, so nothing is lost when people graduate.

---

Made with ❤️ by the CGN Social AI Club.

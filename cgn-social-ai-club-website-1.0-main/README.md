# TUM Social AI Club Website 2.0

This is the official website for the TUM Social AI Club. The site showcases our mission, projects, partners, team, and how to get involved.

## 🚀 Features
- Modern React + Vite + Tailwind CSS stack
- Dynamic content for projects, team, partners, and sponsors
- Dark mode support
- Responsive and accessible design
- Easy to extend and maintain

## 📦 Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
3. **Build for production:**
   ```sh
   npm run build
   ```

## 🛠️ Project Structure
- `src/pages/` — Main site pages
- `src/components/` — UI and section components
- `src/data/` — Static data (team, projects, etc.)
- `public/` — Static assets (images, logos, etc.)

## 🧩 Content Updates (Members, Projects, Partners, Sponsors)

### Members (Community Page)
Members are defined in `src/data/team.json` and loaded via `src/utils/cms.js`.

**Where to edit**
- `src/data/team.json`

**Entry shape**
```json
{
  "id": "unique-id",
  "name": "Full Name",
  "role": "Team Lead",
  "department": "Engineering",
  "image": "/cms/team/First_Last.jpg",
  "linkedin": "https://www.linkedin.com/in/...",
  "github": "https://github.com/...",
  "email": "name@domain.com",
  "zoom": 1,
  "offsetX": 50,
  "offsetY": 50,
  "status": "active member"
}
```

**Image placement**
- Put member photos in `public/cms/team/`
- Reference them as `/cms/team/Your_Image.jpg` in `team.json`

### Projects (Projects Section)
Projects are defined in `src/data/projects.json` and linked to authors via `authorId` (from `team.json`).

**Where to edit**
- `src/data/projects.json`

**Entry shape**
```json
{
  "id": "1",
  "title": "Project Title",
  "description": "Short card description",
  "content": "## Markdown content for the detail view",
  "tags": ["Tag1", "Tag2"],
  "image": "/cms/all-partner-logos/partner-logo.svg",
  "isLogo": true,
  "status": "Active",
  "partner": "Partner Name",
  "authorId": "team-member-id",
  "date": "February 2026"
}
```

**Image placement**
- Logos used in project cards: `public/cms/all-partner-logos/`
- Project images/photos: `public/cms/team/` (or any folder under `public/`), referenced by `/cms/...`

### Project Partners (Nonprofits page)
Project partner cards are defined in `src/pages/SocialPartnersPage.jsx` as the `socialPartners` array.

**Where to edit**
- `src/pages/SocialPartnersPage.jsx`

**Entry shape**
```js
{
  name: 'Partner Name',
  logo: '/cms/all-partner-logos/partner-coloured.svg',
  logoFallback: '/cms/all-partner-logos/partner-logo.png',
  description: 'Short description'
}
```

**Logo placement**
- `public/cms/all-partner-logos/`

### Sponsors / Supporters (Main page + Partners page)
Sponsors and supporters are defined in `src/components/sections/SponsorsSection.jsx`.

**Where to edit**
- `src/components/sections/SponsorsSection.jsx`

**Entry shape**
```js
{
  name: 'Org Name',
  tier: 'gold' | 'silver' | 'bronze' | 'supporter',
  logo: '/cms/strategic-partner-logos/supporter/logo.png',
  logoDark: '/cms/strategic-partner-logos/supporter/logo-dark.png'
}
```

**Logo placement**
- `public/cms/strategic-partner-logos/`

### Partner Marquee (Homepage strip)
Scrolling partner logos live in `src/components/ui/PartnerMarquee.jsx` as the `logos` array.

**Where to edit**
- `src/components/ui/PartnerMarquee.jsx`

**Entry shape**
```js
{ src: '/cms/all-partner-logos/partner-blue.svg', alt: 'Partner Name', heightClass: 'h-12' }
```

**Logo placement**
- `public/cms/all-partner-logos/`

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
MIT

---

Made with ❤️ by the TUM Social AI Club
*

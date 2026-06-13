import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, getIndexableRoutes } from '../src/utils/seoConfig.js';
const TODAY = new Date().toISOString().slice(0, 10);
const ROUTES = getIndexableRoutes();

const xmlBody = ROUTES.map((route) => {
    const loc = `${SITE_URL}${route.path}`;
    return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${TODAY}</lastmod>`,
        `    <changefreq>${route.changefreq}</changefreq>`,
        `    <priority>${route.priority}</priority>`,
        '  </url>',
    ].join('\n');
}).join('\n');

const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    xmlBody,
    '</urlset>',
    '',
].join('\n');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '..', 'public');
const sitemapPath = path.resolve(publicDir, 'sitemap.xml');

mkdirSync(publicDir, { recursive: true });
writeFileSync(sitemapPath, xml, 'utf8');

console.log(`Sitemap generated at ${sitemapPath} with ${ROUTES.length} routes.`);

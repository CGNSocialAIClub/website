import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTE_SEO, SITE_URL, getIndexableRoutes } from '../src/utils/seoConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const indexPath = path.resolve(distDir, 'index.html');

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function applyRouteMeta(template, routePath, routeMeta) {
    const title = routeMeta?.title || 'CGN Social AI Club';
    const fullTitle = title === 'CGN Social AI Club' ? title : `CGN Social AI Club | ${title}`;
    const description = routeMeta?.description || '';
    const robots = routeMeta?.noIndex ? 'noindex, nofollow' : 'index, follow';
    const canonicalUrl = `${SITE_URL}${routePath}`;

    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(fullTitle)}</title>`);
    html = html.replace(/<link id="app-canonical" rel="canonical" href="[^"]*"\s*\/?>/, `<link id="app-canonical" rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);
    html = html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${escapeHtml(robots)}" />`);
    html = html.replace(/<meta name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}">`);
    html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
    html = html.replace(/<meta property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta property="twitter:url" content="[^"]*"\s*\/?>/, `<meta property="twitter:url" content="${escapeHtml(canonicalUrl)}" />`);
    html = html.replace(/<meta property="twitter:title" content="[^"]*"\s*\/?>/, `<meta property="twitter:title" content="${escapeHtml(fullTitle)}" />`);
    html = html.replace(/<meta property="twitter:description"\s+content="[^"]*"\s*\/?>/, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
    return html;
}

const templateHtml = readFileSync(indexPath, 'utf8');
const routes = getIndexableRoutes();

for (const route of routes) {
    const routePath = route.path;
    const routeMeta = ROUTE_SEO[routePath];
    const html = applyRouteMeta(templateHtml, routePath, routeMeta);
    const outputPath = routePath === '/'
        ? path.resolve(distDir, 'index.html')
        : path.resolve(distDir, routePath.slice(1), 'index.html');

    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, 'utf8');
}

console.log(`Generated route-specific HTML for ${routes.length} routes in ${distDir}.`);

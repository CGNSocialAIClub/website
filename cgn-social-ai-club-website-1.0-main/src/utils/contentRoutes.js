import { getProjects } from './cms.js';
import events from '../data/events.json' with { type: 'json' };

// Stable URL: set `slug` in projects.json (falls back to project-<id>), so renaming a title never breaks links.
export const projectArticlePath = project => project.hasArticle ? `/projects/${project.slug || `project-${project.id}`}` : null;
export const eventArticlePath = event => `/events/${event.id}`;
export function getContentEntries(locale = 'en') {
  return [
    ...getProjects(locale).filter(p => p.hasArticle && projectArticlePath(p)).map(item => ({ kind:'project', path:projectArticlePath(item), item })),
    ...events.filter(e => e.published === true).map(e => ({ kind:'event', path:eventArticlePath(e), item:{...e,...(e[locale] || e.en)} })),
  ];
}
export const getContentEntry = (path, locale = 'en') => getContentEntries(locale).find(entry => entry.path === path);
export const conciseDescription = text => text.length <= 165 ? text : `${text.slice(0,162).replace(/\s+\S*$/, '')}…`;

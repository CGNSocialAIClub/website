import { getProjects } from './cms.js';
import events from '../data/events.json' with { type: 'json' };

// Stable URLs do not change when an editorial title is revised.
const PROJECT_SLUGS = {
  '1': 'wrpbench', '2': 'gute-dinge-ki', '3': 'geospatial-ai-well-drilling',
  '4': 'impendo', '5': 'initiativgruppe-chatbot', '7': 'aflaconnect',
  '8': 'allocura', '9': 'political-transparency', '10': 'kolpo',
};
export const projectArticlePath = project => PROJECT_SLUGS[project.id] ? `/projects/${PROJECT_SLUGS[project.id]}` : null;
export const eventArticlePath = event => `/events/${event.id}`;
export function getContentEntries(locale = 'en') {
  return [
    ...getProjects(locale).filter(p => p.hasArticle && projectArticlePath(p)).map(item => ({ kind:'project', path:projectArticlePath(item), item })),
    ...events.filter(e => e.published === true).map(e => ({ kind:'event', path:eventArticlePath(e), item:{...e,...(e[locale] || e.en)} })),
  ];
}
export const getContentEntry = (path, locale = 'en') => getContentEntries(locale).find(entry => entry.path === path);
export const conciseDescription = text => text.length <= 165 ? text : `${text.slice(0,162).replace(/\s+\S*$/, '')}…`;

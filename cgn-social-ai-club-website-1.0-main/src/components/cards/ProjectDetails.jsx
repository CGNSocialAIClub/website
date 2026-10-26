import { useState } from 'react';
import EventDetails from '../events/EventDetails';
import { useLocale } from '../../i18n/LocaleContext';
import '../../pages/EventsPage.css';

// Projects and events share one article scene, carousel, photo viewer and gestures.
export function projectArticle(project) {
  return {
    ...project,
    id: `project-${project.id}`,
    articleKind: 'project',
    category: project.status,
    publishedDate: project.date,
    location: project.author?.name || '',
    imageFit: project.imageFit || (project.isLogo ? 'contain' : 'cover'),
    gallery: (project.gallery || []).map(image => typeof image === 'string' ? { src:image, alt:project.title } : image),
    registrationOpen: false,
  };
}

export default function ProjectDetails({ project, author, projects = [project], onClose }) {
  const { locale } = useLocale();
  const [selectedId, setSelectedId] = useState(project.id);
  const items = projects.filter(item => item.hasArticle).map(item => projectArticle(item, locale));
  const selected = items.find(item => item.id === `project-${selectedId}`)
    || projectArticle({ ...project, author }, locale);
  return <EventDetails event={selected} events={items} onNavigate={item => setSelectedId(item.id.replace(/^project-/, ''))} onClose={onClose} now={Date.now()}/>;
}

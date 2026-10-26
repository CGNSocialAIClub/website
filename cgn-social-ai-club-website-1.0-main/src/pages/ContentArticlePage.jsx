import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLocale } from '../i18n/LocaleContext';
import { getContentEntry } from '../utils/contentRoutes';
import { eventDateLabel, eventTimeLabel } from '../components/events/eventUtils';
import Seo from '../components/ui/Seo';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import OptimizedImage from '../components/ui/OptimizedImage';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import styles from '../components/cards/ProjectDetails.module.css';
import ProjectContributors from '../components/cards/ProjectContributors';
import ProjectArticleDate from '../components/cards/ProjectArticleDate';
import EventExternalActions from '../components/events/EventExternalActions';
import NotFound from './NotFound';

// A readable permanent article destination, using the same editorial source as
// the animated overview dialogs. Both the first HTML response and React show it.
export default function ContentArticlePage() {
  const { pathname } = useLocation();
  const { locale, t } = useLocale();
  const entry = getContentEntry(pathname.replace(/\/$/, ''), locale);
  if (!entry) return <NotFound />;
  const { item, kind } = entry;
  const project = kind === 'project';
  const overview = project ? '/projects' : '/events';
  const de = locale === 'de';
  return <>
    <Seo />
    <Container className="py-12">
      <nav aria-label={de ? 'Seitennavigation' : 'Breadcrumb'} className="mb-8 text-sm text-[var(--text-secondary)]">
        <Link to={overview}>{project ? (de ? 'Projekte' : 'Projects') : 'Events'}</Link>
        <span aria-hidden="true"> / </span><span>{item.title}</span>
      </nav>
      <article>
        <header className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-end mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-default)]">
            <OptimizedImage src={item.image} alt={item.title} fallback={<ImagePlaceholder />} className="w-full aspect-[16/10] object-contain" style={{background:item.imageBackground || (item.isLogo ? '#fff' : 'var(--bg-surface)'),padding:item.imagePadding || (item.isLogo ? '10%' : undefined)}} sizes="(min-width:768px) 440px, 100vw" />
            {!project && item.photoCredit && <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-1 text-[length:var(--type-micro)] text-white">© {item.photoCredit}</span>}
          </div>
          <div className={project ? "md:self-stretch md:flex md:flex-col" : undefined}>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] mb-3">{project ? t.projects.statuses[item.status] || item.status : item.category}</p>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-heading font-bold leading-heading mb-5" style={{textWrap:'balance'}}>{item.title}</h1>
            {project ? <div className="hidden md:block md:mt-auto"><ProjectContributors contributors={item.contributors}/></div> : <p className="text-[var(--text-secondary)]">{eventDateLabel(item, locale)}{eventTimeLabel(item,locale) && ` – ${eventTimeLabel(item,locale)}`}<br/>{item.location}</p>}
            {!project && <div className="hidden md:flex flex-wrap gap-3 mt-5"><EventExternalActions event={item} locale={locale} includePast variant="secondary"/></div>}
          </div>
        </header>
        {project && <p className="text-lg text-[var(--text-secondary)] mb-8">{item.description}</p>}
        <div className={`max-w-3xl ${project ? 'border-t border-[var(--border-subtle)] pt-6' : ''}`}>{project && <ProjectArticleDate date={item.date}/>}<div className={styles['project-article']}><ReactMarkdown>{item.content}</ReactMarkdown></div>{project && <ProjectArticleDate date={item.date} mobileFooter/>}</div>
        {project && <div className="md:hidden"><ProjectContributors contributors={item.contributors} footer/></div>}
        {!project && <div className="flex md:hidden flex-wrap gap-4 mt-8">
          <EventExternalActions event={item} locale={locale} includePast variant="secondary"/>
        </div>}
      </article>
      <div className="mt-12 flex flex-wrap gap-4"><Button href={overview} variant="secondary">{de ? 'Zur Übersicht' : 'Back to overview'}</Button><Button href={project?'/social-partners':'/projects'} variant="tertiary">{project?(de?'Gemeinsam ein Projekt starten':'Start a project together'):(de?'Projekte entdecken':'Explore projects')}</Button></div>
    </Container>
  </>;
}

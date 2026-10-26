import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import ArticleBadge from '../ui/ArticleBadge.jsx';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import { createContext, forwardRef, useContext } from 'react';
import { motion } from 'framer-motion';
import StraightMorphTitle from './StraightMorphTitle';
import { CalendarDays, MapPin } from 'lucide-react';
import { rememberArticleCard } from '../../hooks/useArticleExpansion';
import { eventDateLabel, eventTimeLabel } from './eventUtils';
import { useLocale } from '../../i18n/LocaleContext';

export const EVENT_CARD_STATES = Object.freeze({
  GRID: 'grid', CALENDAR: 'calendar', PREVIEW: 'preview',
  OPEN_MOBILE: 'open-mobile', OPEN_DESKTOP: 'open-desktop', PICKER: 'picker',
});
const CardContext = createContext(null);
const useCard = () => useContext(CardContext);

// All presentations share these elements and their event-scoped motion identity.
export function EventCardImage({ as = 'div', className, ...props }) {
  const { event, morph, transition, state } = useCard();
  const showCredit = state === EVENT_CARD_STATES.OPEN_MOBILE || state === EVENT_CARD_STATES.OPEN_DESKTOP;
  const Element = as === 'button' ? motion.button : motion.div;
  return <Element layout={morph ? "preserve-aspect" : false} layoutId={morph ? `event-cover-${event.id}` : undefined} transition={transition} data-event-part="cover" className={className} {...props}>
    <OptimizedImage as={motion.img} layout={morph ? "preserve-aspect" : false} transition={transition} src={event.image} alt={event.title} style={{ objectFit: event.articleKind === 'project' ? (event.imageFit || 'contain') : 'cover', background:event.imageBackground, ...(event.articleKind === 'project' && event.isLogo ? {padding:event.imagePadding||'10%',background:'#fff'} : {}), ...(event.articleKind === 'project' && event.imagePadding?{padding:event.imagePadding}:{}) }} draggable={false} fallback={<ImagePlaceholder/>} />
    {showCredit && event.photoCredit && <span className="event-image-credit">© {event.photoCredit}</span>}
  </Element>;
}
export function EventCardTitle({ as = 'h3', ...props }) {
  const {event,transition}=useCard();
  return <StraightMorphTitle as={as} text={event.title} kind={event.articleKind==='project'?'project':'event'} transition={transition} {...props}/>;
}

// One header tree for every card state, for both content kinds.
export function EventCardHeader({ scene=false, coverProps={}, badgeProps={}, infoProps={}, titleProps={}, titleBlockProps={}, headerProps={}, children }) {
  const {event}=useCard();
  const {t}=useLocale();
  const project=event.articleKind==='project';
  const category=project?event.status:event.category;
  return <motion.div {...headerProps} className={scene?'event-scene-header':project?'project-card-header':'event-card-header'}>
    <EventCardImage className={scene?'event-scene-cover':project?`project-card-cover relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] ${event.isLogo?'bg-white':'bg-[var(--bg-surface-subtle)]'}`:'event-state-image'} {...coverProps}/>
    {!event.hideStatusBadge && <ArticleBadge category={category}
      className={scene?'event-detail-category':project?'project-card-category':'event-state-label'} {...badgeProps}>
      {(project?(t.projects.statuses[category]||category):category||'').toUpperCase()}
    </ArticleBadge>}
    <motion.div {...infoProps} className={scene?'event-scene-info':project?'project-card-info':'event-state-info'}>
      <motion.div data-header-title-block {...titleBlockProps}>
        <EventCardTitle as={scene?'h2':'h3'} {...titleProps}/>
      </motion.div>
      {children}
    </motion.div>
  </motion.div>;
}

export function EventCardDate({ children, ...props }) {
  const { event, morph, transition } = useCard();
  const { locale } = useLocale();
  return <motion.p layout={morph ? "position" : false} layoutId={morph ? `event-date-${event.id}` : undefined} transition={transition} data-event-part="date" {...props}><CalendarDays size={17} aria-hidden="true"/><span className="event-date-text">{children || eventDateLabel(event, locale)}</span></motion.p>;
}

export function EventCardMetadata({event,locale,dateWrap,locationWrap,dateProps={},locationProps={}}) {
  const {state}=useCard();
  const atGrid=state==='grid'||state==='returning';
  const start=eventTimeLabel(event,locale);
  return <>
    <EventCardDate data-meta-wrap={atGrid?undefined:dateWrap} {...dateProps}>{eventDateLabel(event,locale)}{start&&` – ${start}`}</EventCardDate>
    <motion.p className="event-location" data-meta-wrap={atGrid?undefined:locationWrap} title={event.location} {...locationProps}><MapPin size={17} aria-hidden="true"/><span>{event.location}</span></motion.p>
  </>;
}

// The state changes composition; event data, media and transition identity do not.
const EventCard = forwardRef(function EventCard({ event, state, morph = true, transition, children, metadata, actions, className = '', onClickCapture, ...props }, ref) {
  const open = state === 'open-mobile' || state === 'open-desktop';
  const Element = open || state === 'grid' || props['data-scene-card'] ? motion.div : motion.button;
  const defaults = {
    grid: 'event-state-grid', calendar: 'event-state-calendar', preview: 'event-state-preview', picker: 'event-state-picker',
  };
  return <CardContext.Provider value={{ event, morph, transition, state }}>
    <Element layout={morph} ref={ref} data-event-id={event.id} data-card-state={state} data-event-category={event.category}
      layoutId={morph && state !== 'picker' ? `event-surface-${event.id}` : undefined}
      transition={transition} className={`${props['data-scene-card']?'':defaults[state] || ''} ${className}`}
      onClickCapture={(e) => { if (state === 'grid' || state === 'calendar') rememberArticleCard(`event-article-${event.id}`, e.currentTarget); onClickCapture?.(e); }} {...props}>
      {children || (state==='picker'?<EventCardImage className="event-state-image"/>:<EventCardHeader>
        {state==='grid'?metadata:state==='preview'?<EventCardDate/>:null}
        {state==='grid'&&actions}
      </EventCardHeader>)}
    </Element>
  </CardContext.Provider>;
});
export default EventCard;

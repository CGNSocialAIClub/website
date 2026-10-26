import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';
import AvatarPlaceholder from '../ui/AvatarPlaceholder';
import { useLocale } from '../../i18n/LocaleContext';
import './ProjectContributors.css';

// This is one persistent part of the article header. Its parent owns movement;
// only the date space and the other members' opacity change for a preview.
export default function ProjectContributors({ contributors = [], date, compact = false, flush = false, footer = false, animated = false, transition, returning = false, entering = false }) {
  const { locale } = useLocale();
  const de = locale === 'de';
  const reduceMotion = useReducedMotion();
  const duration = animated && !reduceMotion ? transition?.duration ?? .45 : 0;
  const geometry = { ...transition, duration, delay: 0 };
  const visibility = compact
    ? { duration: Math.min(.12, duration), delay: 0 }
    : { duration: duration * .15, delay: duration * .85 };
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const measure = () => {
    const el = track.current;
    if (el) setEdges(previous => {
      const next = { start: el.scrollLeft < 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 };
      return previous.start === next.start && previous.end === next.end ? previous : next;
    });
  };
  useLayoutEffect(() => {
    if (compact && track.current) track.current.scrollLeft = 0;
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, [contributors, compact]);
  const roles = { lead: 'Team Lead', contributor: de ? 'Projektteam' : 'Project team', technicalAdvisor: 'Technical Advisor' };
  if (!contributors.length && !date) return null;
  return <motion.div aria-hidden={returning || undefined} initial={entering?{opacity:0}:false}
    animate={{ marginTop: returning ? 0 : footer ? 36 : compact ? 14 : flush ? 0 : 16, height:returning?0:'auto', opacity:returning||entering?0:1 }} transition={{...geometry,opacity:{duration:returning?Math.min(.08,duration):Math.min(.18,duration),delay:0}}}
    style={{ gap: 0, overflow:returning?'hidden':undefined }} className={`project-credits ${compact ? 'project-credits--compact' : ''} ${footer ? 'project-credits--footer' : ''}`}>
    {date && <motion.div key="date" className="project-credits-date-slot" initial={false}
      aria-hidden={compact || undefined} style={{ overflow: 'hidden', flexShrink: 0 }}
      animate={{ height: compact ? 0 : 21, marginBottom: compact ? 0 : footer ? 16 : 20, opacity: compact ? 0 : 1 }}
      transition={{ height: geometry, marginBottom: geometry, opacity: visibility }}>
      <p className="project-credits-date"><CalendarDays aria-hidden="true"/><span>{date}</span></p>
    </motion.div>}
    <div key="people" ref={track} style={{ gap: 0, flex: 'none', width: '100%' }} className="project-credits-track" data-start={edges.start} data-end={edges.end}
      tabIndex={compact ? undefined : 0} role="group" aria-label={de ? 'Projektteam' : 'Project team'}
      onScroll={measure} onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()} onWheel={e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation(); }}
      onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.stopPropagation(); e.preventDefault(); track.current.scrollBy({left:e.key === 'ArrowRight' ? 210 : -210, behavior:reduceMotion?'auto':'smooth'}); } }}>
      {contributors.map((person, index) => <motion.div key={person.id} initial={false}
        animate={{ opacity: compact && index > 0 ? 0 : 1 }} transition={index === 0 ? { duration: 0 } : visibility}
        aria-hidden={compact && index > 0 || undefined}
        style={{ flexShrink: 0, marginLeft: index > 0 ? 'var(--project-credit-spacing)' : 0 }} className="project-credit-slot">
        <div className="project-credit-person">
          <div className="project-credit-avatar" style={{ borderRadius:'50%', overflow:'hidden' }}>
            {person.image ? <OptimizedImage src={person.image} alt="" fallback={<AvatarPlaceholder size="100%" style={{width:'100%',height:'100%'}}/>}
              style={{width:'100%',height:'100%',display:'block',objectFit:'cover',objectPosition:`${((person.offsetX ?? 0)+100)/2}% ${((person.offsetY ?? 0)+100)/2}%`}}/>
              : <AvatarPlaceholder size="100%" style={{width:'100%',height:'100%'}}/>}
          </div>
          <div><strong>{person.name}</strong><span>{roles[person.projectRole] || roles.contributor}</span></div>
        </div>
      </motion.div>)}
    </div>
  </motion.div>;
}

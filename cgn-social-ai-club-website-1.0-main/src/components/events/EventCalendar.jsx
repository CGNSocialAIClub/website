import OptimizedImage from '../ui/OptimizedImage.jsx';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { CalendarPlus, CalendarDays, MapPin, ChevronUp, ChevronDown, ArrowUpRight, X } from 'lucide-react';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { eventDateLabel, eventTimeLabel, formatDate, LUMA_ICAL, LUMA_WEBCAL } from './eventUtils';
import { rememberArticleCard } from '../../hooks/useArticleExpansion';
import { adjacentEventMonth, buildCalendar, resolveMonth } from './calendarModel.mjs';
import './EventCalendar.css';

export default function EventCalendar({ events, today, requestedMonth, onMonthChange, onOpen }) {
  const { locale } = useLocale();
  const de = locale === 'de';
  const reducedMotion = useReducedMotion();
  const calendarRef=useRef(null);
  const [calendarSize,setCalendarSize]=useState({weekHeights:{}});
  useLayoutEffect(()=>{
    const measure=()=>{
      if(!calendarRef.current)return;
      const weekHeights={};
      calendarRef.current.querySelectorAll('[data-calendar-week]').forEach(week=>{
        const entries=[...week.querySelectorAll('.ecal-event')];
        if(!entries.length)return;
        const laneCount=Math.max(...entries.map(entry=>Number(entry.dataset.lane)))+1;
        const laneHeight=Math.max(...entries.map(entry=>{
          const style=getComputedStyle(entry);
          const label=entry.querySelector('.ecal-event-type');
          const image=entry.querySelector('.ecal-event-cover');
          return Math.ceil(label.getBoundingClientRect().height+image.getBoundingClientRect().width+
            parseFloat(style.gap)+parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+
            parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth));
        }));
        weekHeights[week.dataset.calendarWeek]=31+6+laneCount*laneHeight+(laneCount-1)*4;
      });
      setCalendarSize(previous=>JSON.stringify(previous.weekHeights)===JSON.stringify(weekHeights)?previous:{weekHeights});
    };
    const observer=new ResizeObserver(measure);
    observer.observe(calendarRef.current);window.addEventListener('resize',measure);measure();
    document.fonts?.ready.then(measure);
    return()=>{observer.disconnect();window.removeEventListener('resize',measure);};
  },[events,locale]);
  const calendar = useMemo(() => buildCalendar(events, today, 97, 0, calendarSize.weekHeights), [events, today, calendarSize]);
  const current = resolveMonth(calendar, requestedMonth, today);
  const previous = adjacentEventMonth(calendar.months, current.key, -1);
  const next = adjacentEventMonth(calendar.months, current.key, 1);
  const y = useMotionValue(-current.offset);
  const height = useMotionValue(current.height);
  const [settled, setSettled] = useState(current.key);
  const [highlighted, setHighlighted] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const subscribeRef = useRef(null);
  useEffect(() => {
    if (!subscribeOpen) return;
    const dismiss = event => {
      if (!subscribeRef.current?.contains(event.target)) setSubscribeOpen(false);
    };
    const escape = event => {
      if (event.key === 'Escape') {
        setSubscribeOpen(false);
        subscribeRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [subscribeOpen]);
  const destination = useRef(current.key);

  // A single progress value drives both the track and its viewport. No DOM scrolling,
  // timers, snap points or independently timed height animations can fight each other.
  useLayoutEffect(() => {
    const fromY = y.get(), fromHeight = height.get();
    destination.current = current.key;
    setSelectedDay(null);
    setSubscribeOpen(false);
    setHighlighted(null);
    if (reducedMotion || (fromY === -current.offset && fromHeight === current.height)) {
      y.set(-current.offset); height.set(current.height); setSettled(current.key);
      return;
    }
    setSettled(null);
    const animation = animate(0, 1, {
      duration: Math.min(1.4, .75 + Math.abs(fromY + current.offset) / 1600),
      ease: [.45, 0, .2, 1],
      onUpdate: progress => {
        y.set(fromY + (-current.offset - fromY) * progress);
        height.set(fromHeight + (current.height - fromHeight) * progress);
      },
      onComplete: () => setSettled(destination.current),
    });
    return () => animation.stop();
  }, [current.key, current.offset, current.height, reducedMotion, y, height]);

  const open = (event, node) => {
    rememberArticleCard(`event-article-${event.id}`, node);
    onOpen(event);
  };
  const agenda = selectedDay
    ? current.events.filter(event => current.weeks.some(week => week.days.some(day => day.key === selectedDay && day.events.some(item => item.event.id === event.id))))
    : current.events;

  return <section ref={calendarRef} className="ecal" aria-label={de ? 'Eventkalender' : 'Event calendar'}>
    <header className="ecal-header">
      <h2 aria-live="polite">{formatDate(`${current.key}-01T12:00:00Z`, locale, { day: undefined, month: 'long' })}</h2>
      <div className="ecal-navigation">
        <Button variant="secondary" className="h-11 w-11 p-0" disabled={!previous} aria-label={de ? 'Vorheriger Eventmonat' : 'Previous event month'} onClick={() => onMonthChange(previous.key)}><ChevronUp size={20}/></Button>
        <Button variant="secondary" className="h-11 px-5 py-0" onClick={() => onMonthChange(today.slice(0, 7))}>{de ? 'Heute' : 'Today'}</Button>
        <Button variant="secondary" className="h-11 w-11 p-0" disabled={!next} aria-label={de ? 'Nächster Eventmonat' : 'Next event month'} onClick={() => onMonthChange(next.key)}><ChevronDown size={20}/></Button>
      </div>
    </header>
    <div className="ecal-weekdays" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index}>{new Intl.DateTimeFormat(de ? 'de-DE' : 'en-GB', { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 0, 5 + index)))}</span>)}</div>
    <motion.div className="ecal-viewport" style={{ height }} aria-busy={!settled}>
      <motion.div className="ecal-track" style={{ y }}>
        {calendar.months.map(month => <div className="ecal-month" key={month.key} data-calendar-month={month.key} data-active={settled === month.key} aria-hidden={current.key !== month.key} inert={current.key !== month.key || !settled}>
          {month.weeks.map((week, weekIndex) => <div className="ecal-week" data-calendar-week={`${month.key}-${weekIndex}`} key={weekIndex} style={{ height: week.height }}>
            {week.days.map((day, column) => <div key={day.key} className="ecal-day" data-outside={day.outside}>
              <button type="button" className="ecal-number" data-today={!day.outside && day.key === today} data-selected={day.key === selectedDay} disabled={day.outside} aria-label={formatDate(`${day.key}T12:00:00Z`, locale)} aria-pressed={day.key === selectedDay} onClick={() => setSelectedDay(day.key)}>{day.number}</button>
            </div>)}
            <div className="ecal-events">{week.segments.map(({event, column, span, lane}) =>
              <button type="button" key={event.id} className="ecal-event" style={{gridColumn:`${column + 1} / span ${span}`,gridRow:lane + 1}}
                data-lane={lane} data-event-id={event.id} data-event-category={event.category} data-highlighted={highlighted === event.id}
                aria-label={`${event.title} – ${eventDateLabel(event, locale)}`} title={event.title}
                onPointerEnter={() => setHighlighted(event.id)} onPointerLeave={() => setHighlighted(null)} onFocus={() => setHighlighted(event.id)} onBlur={() => setHighlighted(null)}
                onClick={e => open(event, e.currentTarget)}>
                <small className="ecal-event-type">{event.category.toUpperCase()}</small>
                <OptimizedImage className="ecal-event-cover" src={event.image} alt="" loading="lazy" sizes="64px" draggable={false}
                  style={{background:event.imageBackground}}/>
              </button>
            )}</div>
          </div>)}
        </div>)}
      </motion.div>
    </motion.div>
    <div className="ecal-agenda">
      <h3>{selectedDay ? formatDate(`${selectedDay}T12:00:00Z`, locale) : de ? 'Diesen Monat' : 'This month'}</h3>
      {agenda.map(event => <div className="ecal-agenda-row" key={event.id}><button type="button" className="ecal-agenda-item" onClick={e => open(event, e.currentTarget)}>
        <span className="ecal-agenda-media"><OptimizedImage className="ecal-agenda-cover" src={event.image} alt="" loading="lazy"/></span>
        <div className="ecal-agenda-info"><small className="ecal-agenda-type">{event.category.toUpperCase()}</small><strong>{event.title}</strong><span className="ecal-agenda-meta"><CalendarDays size={15} aria-hidden="true"/><span>{eventDateLabel(event, locale)}{eventTimeLabel(event, locale) && ` – ${eventTimeLabel(event, locale)}`}</span></span><span className="ecal-agenda-meta"><MapPin size={15} aria-hidden="true"/><span>{event.location}</span></span></div>
        <ArrowUpRight className="ecal-agenda-arrow" size={20} aria-hidden="true"/>
      </button></div>)}
      {!agenda.length && <p>{de ? 'Keine Events in diesem Zeitraum.' : 'No events in this period.'}</p>}
    </div>
    <footer className="ecal-footer">
      <motion.div ref={subscribeRef} className="ecal-subscribe" initial={false} animate={{width:256}} transition={{type:'tween',duration:reducedMotion ? 0 : .22,ease:[.2,0,.2,1]}}>
        <AnimatePresence initial={false}>
        {subscribeOpen && <motion.div key="subscription-options" id="calendar-subscription-options" className="ecal-subscribe-options" initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} transition={{type:'tween',duration:reducedMotion ? 0 : .22,ease:[.2,0,.2,1]}}>
        <div className="ecal-subscribe-menu" onClick={event => { if(event.target.closest('a')) setSubscribeOpen(false); }}>
          <p>{de ? 'Neue Events automatisch in deinem Kalender.' : 'New events, automatically in your calendar.'}</p>
          <a href={`https://www.google.com/calendar/render?cid=${encodeURIComponent(LUMA_ICAL)}`} target="_blank" rel="noopener noreferrer">Google Calendar<ArrowUpRight size={16}/></a>
          <a href={LUMA_WEBCAL}>Apple {de ? 'Kalender' : 'Calendar'}<ArrowUpRight size={16}/></a>
          <a href={`https://outlook.live.com/calendar/0/addcalendar?url=${encodeURIComponent(LUMA_WEBCAL)}`} target="_blank" rel="noopener noreferrer">Outlook<ArrowUpRight size={16}/></a>
          <a href={LUMA_ICAL} target="_blank" rel="noopener noreferrer">{de ? 'ICS-Feed öffnen' : 'Open ICS feed'}<ArrowUpRight size={16}/></a>
        </div>
        </motion.div>}
        </AnimatePresence>
        <Button variant="secondary" className="ecal-subscribe-trigger h-12 w-full p-0 border-0 shadow-none" aria-label={subscribeOpen ? (de ? 'Schließen' : 'Close') : (de ? 'Kalender abonnieren' : 'Subscribe to calendar')} title={subscribeOpen ? (de ? 'Schließen' : 'Close') : (de ? 'Kalender abonnieren' : 'Subscribe to calendar')} aria-expanded={subscribeOpen} aria-controls="calendar-subscription-options" onClick={() => setSubscribeOpen(open => !open)}>{subscribeOpen ? <X size={17} aria-hidden="true"/> : <CalendarPlus size={17} aria-hidden="true"/>}<span>{subscribeOpen ? (de ? 'Schließen' : 'Close') : (de ? 'Kalender abonnieren' : 'Subscribe to calendar')}</span></Button>
      </motion.div>
    </footer>
  </section>;
}

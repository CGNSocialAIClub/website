import { eventArticlePath } from '../utils/contentRoutes';
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import Container from "../components/ui/Container";
import HeadingSection from "../components/ui/HeadingSection";
import EventCard, { EventCardMetadata } from "../components/events/EventCard";
import CTASection from "../components/sections/CTASection";
import Seo from "../components/ui/Seo";
import Button from "../components/ui/Button";
import EventExternalActions from '../components/events/EventExternalActions';
import EventDetails from "../components/events/EventDetails";
import EventCalendar from "../components/events/EventCalendar";
import EventsViewSwitcher from "../components/events/EventsViewSwitcher";
import useAlignedEventRows from "../components/events/useAlignedEventRows";
import eventData from "../data/events.json";
import { useLocale } from "../i18n/LocaleContext";
import {
  dayKey,
  hasEnded,
  LUMA_CALENDAR,
  visibleEvents,
} from "../components/events/eventUtils";
import "./EventsPage.css";

export default function EventsPage() {
  const { locale } = useLocale();
  const de = locale === "de";
  const reduceMotion = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const view = ["cards", "calendar"].includes(params.get("view"))
    ? params.get("view")
    : "cards";
  const eventGridRoot = useAlignedEventRows(view, locale);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  const today = dayKey(now);
  const events = visibleEvents(eventData, locale);
  const selectedEvent = events.find(
    (event) => event.id === params.get("event"),
  );
  const upcoming = events
    .filter((event) => !hasEnded(event, now))
    .sort((a, b) => new Date(a.start) - new Date(b.start));
  const past = events
    .filter((event) => hasEnded(event, now))
    .sort((a, b) => new Date(b.start) - new Date(a.start));
  const update = (key, value) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace: true },
    );
  const open = (event) => update("event", event.id);
  const close = () => update("event", null);
  const more = de ? "Details ansehen" : "View details";
  const action = (event) => (
    <div className="event-actions">
      <EventExternalActions event={event} locale={locale} now={now}/>
      <Button href={eventArticlePath(event)} variant="primary" onClick={e => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); open(event); } }}>
        {more}
      </Button>
    </div>
  );
  const card = (event) => (
    <EventCard
      key={event.id}
      event={event}
      state="grid"
      morph={false}
      metadata={<div className="event-card-meta">
        <EventCardMetadata event={event} locale={locale}/>
      </div>}
      actions={action(event)}
    />
  );
  const group = (items, title) => (
    <section className="event-section" aria-label={title}>
      {items.length > 0 && <div className="event-section-heading">
        <h2>{title}</h2>
      </div>}
      {items.length ? (
        <div className={`event-cards${items === upcoming ? " event-cards--upcoming" : ""}`}>{items.map(card)}</div>
      ) : (
        <div className="event-cards event-cards--upcoming">
          <article className="event-state-grid event-announcement">
            <h3>{de ? "Neue Termine folgen." : "More events coming soon."}</h3>
            <p>{de
              ? "Folge uns auf Luma für die nächsten Veranstaltungen."
              : "Follow us on Luma for upcoming events."}</p>
            <div className="event-actions">
              <Button variant="primary" href={LUMA_CALENDAR} target="_blank" rel="noopener noreferrer">
                {de ? "Luma öffnen" : "Open Luma"}
              </Button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
  return (
    <LayoutGroup id="event-cards">
    <div ref={eventGridRoot} className="events-page pb-16">
      <Seo />
      <Container>
        <HeadingSection
          as="h1"
          badge="EVENTS"
          title={
            de
              ? "Gemeinsam lernen.\nMehr bewegen."
              : "Meet. Learn.\nMake a difference."
          }
          subtitle={
            de
              ? "Workshops, Hackathons und weitere spannende Events."
              : "Workshops, hackathons and other exciting events."
          }
        />
        <div className="events-toolbar">
          <EventsViewSwitcher view={view} locale={locale} onChange={id => update('view', id)}/>
        </div>
        <motion.div
          key={view}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {view !== "calendar" ? (
            <>
              {group(upcoming, de ? "Demnächst bei uns" : "Coming up")}
              {past.length > 0 && group(past, de ? "Vergangene Events" : "Past events")}
            </>
          ) : (
            <EventCalendar events={events} today={today} requestedMonth={params.get('month')}
              onMonthChange={key => update('month', key)} onOpen={open} />
          )}
        </motion.div>

      </Container>
      <CTASection
        heading={de ? 'Beim nächsten Mal dabei?' : 'See you at the next one.'}
        text={de ? 'Entdecke unsere nächsten Events auf Luma. Ihr möchtet als Unternehmen oder Organisation ein Event mit uns gestalten? Lasst uns eure Idee besprechen.' : 'Discover our next events on Luma. Want to host an event with us as a company or organisation? Let’s talk about your idea.'}
        buttons={[
          {label: 'Open Luma', href: LUMA_CALENDAR, variant: 'primary'},
          {label: de ? 'Eventidee besprechen' : 'Discuss an event idea', href: '/contact', variant: 'secondary'},
        ]}
      />
      {selectedEvent && (
        <EventDetails event={selectedEvent} events={[...upcoming,...past]} onNavigate={open} onClose={close} now={now} />
      )}
    </div>
    </LayoutGroup>
  );
}

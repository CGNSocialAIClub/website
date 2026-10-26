import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Container from '../ui/Container';
import OptimizedImage from '../ui/OptimizedImage';
import Button from '../ui/Button';
import HeadingSection from '../ui/HeadingSection';
import { useLocale } from '../../i18n/LocaleContext';
import './ClubInAction.css';

const PHOTOS = [
  { number: '02', de: 'Mitglieder und Gäste beim ersten Demo Day bei Tanso', en: 'Members and guests at our inaugural Demo Day at Tanso' },
  { number: '04', de: 'Applaus aus dem Publikum', en: 'Applause from the audience' },
  { number: '05', de: 'Projektvorstellung beim Demo Day', en: 'Project presentation at Demo Day' },
  { number: '03', de: 'Vortrag über unsere AI-for-Good-Mission', en: 'Presenting our AI-for-Good mission' },
  { number: '06', de: 'Fragen und Austausch mit dem Publikum', en: 'Questions and discussion with the audience' },
];

export default function ClubInAction() {
  const { locale } = useLocale();
  const de = locale === 'de';
  const reduceMotion = useReducedMotion();
  const galleryId = useId();
  const [order, setOrder] = useState(PHOTOS);
  const grid = useRef(null);
  const tiles = useRef(new Map());
  const prepareMove = () => {
    if (!reduceMotion) grid.current?.querySelector('.club-photo-slot-0')?.setAttribute('data-moving', '');
  };

  const selectPhoto = (number) => {
    prepareMove();
    setOrder(previous => {
      const position = previous.findIndex(photo => photo.number === number);
      // Clicking the large photo brings the next unseen image into the gallery.
      if (position === 0) return [...previous.slice(1), previous[0]];
      const next = [...previous];
      [next[0], next[position]] = [next[position], next[0]];
      return next;
    });
  };

  const step = (direction) => {
    prepareMove();
    setOrder(previous => direction > 0
      ? [...previous.slice(1), previous[0]]
      : [previous.at(-1), ...previous.slice(0, -1)]);
  };

  return (
    <section id="club-in-action" className="w-full section-block" aria-label={de ? 'Einblicke ins Clubleben' : 'Club life in pictures'}>
      <Container>
        <HeadingSection
          badge={de ? 'Unsere Community' : 'Our Community'}
          title={de ? 'Zusammen lernen und weiterdenken' : 'Learning and Thinking Further Together'}
        />
        <div
          ref={grid}
          className="club-photo-tiles"
          tabIndex={0}
          role="group"
          aria-label={de ? 'Fotogalerie. Mit den Pfeiltasten blättern.' : 'Photo gallery. Use arrow keys to browse.'}
          onKeyDown={event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              event.currentTarget.focus({ preventScroll: true });
              step(event.key === 'ArrowRight' ? 1 : -1);
            }
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {order.slice(0, 4).map((photo, slot) => (
              <motion.button
                key={photo.number}
                ref={node => {
                  if (node) tiles.current.set(photo.number, node);
                  else tiles.current.delete(photo.number);
                }}
                onLayoutAnimationStart={() => tiles.current.get(photo.number)?.setAttribute('data-moving', '')}
                onLayoutAnimationComplete={() => tiles.current.get(photo.number)?.removeAttribute('data-moving')}
                layout
                layoutId={`${galleryId}-${photo.number}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduceMotion
                  ? { duration: 0 }
                  : { layout: { type: 'spring', stiffness: 260, damping: 30 }, opacity: { duration: 0.18 } }}
                type="button"
                className={`club-photo-tile club-photo-slot-${slot}`}
                style={{ borderRadius: 24 }}
                onClick={event => {
                  if (slot === 0) event.currentTarget.parentElement.focus({ preventScroll: true });
                  selectPhoto(photo.number);
                }}
                aria-label={`${de ? photo.de : photo.en}. ${slot === 0
                  ? (de ? 'Nächstes Bild anzeigen' : 'Show next image')
                  : (de ? 'Groß anzeigen' : 'Show as main image')}`}
              >
                <OptimizedImage
                  src={`/cms/events/demo-day-first-edition/${photo.number}.jpg`}
                  alt={de ? photo.de : photo.en}
                  className="h-full w-full object-cover"
                  sizes={slot === 0 ? '(min-width: 768px) 840px, 100vw' : '(min-width: 768px) 280px, 33vw'}
                  loading="lazy"
                  draggable={false}
                />
                <span className="club-photo-credit">© Michael Treumann</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {de ? 'Großes Bild: ' : 'Main image: '}{de ? order[0].de : order[0].en}
        </p>
        <div className="section-followup">
          <p className="text-secondary">
            {de ? 'Möchtest du die Menschen hinter unseren Projekten kennenlernen?' : 'Want to meet the people behind our projects?'}
          </p>
          <Button variant="primary" href="/team">
            {de ? 'Unser Team kennenlernen' : 'Meet our team'}
          </Button>
        </div>
      </Container>
    </section>
  );
}

import { useLayoutEffect, useRef } from 'react';
import { CalendarDays, LayoutGrid } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export default function EventsViewSwitcher({ view, onChange, locale }) {
  const indicator = useRef(null);
  const animation = useRef(null);
  const previous = useRef(null);
  const reducedMotion = useReducedMotion();
  useLayoutEffect(() => {
    const node = indicator.current;
    const toX = view === 'calendar' ? node.offsetWidth : 0;
    const from = getComputedStyle(node).transform;
    const fromX = from === 'none' ? 0 : new DOMMatrixReadOnly(from).m41;
    animation.current?.cancel();
    const targetTransform = `translateX(${view === 'calendar' ? 100 : 0}%)`;
    node.style.transform = targetTransform;
    if (previous.current !== null && previous.current !== view && !reducedMotion) {
      animation.current = node.animate([
        { transform: from },
        { transform: `translateX(${(fromX + toX) / 2}px) scaleX(1.18)`, offset: .5 },
        { transform: targetTransform },
      ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    previous.current = view;
  }, [view, reducedMotion]);
  useLayoutEffect(() => () => animation.current?.cancel(), []);
  return <div className="event-segments" role="group" aria-label={locale === 'de' ? 'Ansicht' : 'View'} data-view-switcher>
    <span ref={indicator} className="event-view-indicator" aria-hidden="true"/>
    {[
      ['cards', LayoutGrid, locale === 'de' ? 'Raster' : 'Grid'],
      ['calendar', CalendarDays, locale === 'de' ? 'Kalender' : 'Calendar'],
    ].map(([id, Icon, label]) => <button type="button" key={id} aria-label={label} title={label} aria-pressed={view === id} onClick={() => onChange(id)}><Icon size={17}/></button>)}
  </div>;
}

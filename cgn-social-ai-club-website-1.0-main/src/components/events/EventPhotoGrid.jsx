import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import OptimizedImage from '../ui/OptimizedImage';
import ArticleBadge from '../ui/ArticleBadge';
import './EventPhotoGrid.css';

export default function EventPhotoGrid({ photos, de, enabled, category, initialPhoto, coverReady = true }) {
  const [order, setOrder] = useState(() => {
    const indices = photos.map((_, index) => index);
    const first = photos.findIndex(photo => photo.src === initialPhoto);
    return first > 0 ? [first, ...indices.filter(index => index !== first)] : indices;
  });
  const galleryId = useId();
  const grid = useRef(null);
  const tiles = useRef(new Map());
  const reduceMotion = useReducedMotion();
  const pointer = useRef(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ distance: 0, last: 0, changed: false });
  const visible = order.map(index => ({ ...photos[index], index }));
  const prepareMove = () => {
    if (!reduceMotion) grid.current?.querySelector('.event-photo-tile--main')?.setAttribute('data-moving', '');
  };
  const step = direction => {
    prepareMove();
    grid.current?.focus({ preventScroll: true });
    setOrder(previous => direction > 0
      ? [...previous.slice(1), previous[0]] : [previous.at(-1), ...previous.slice(0, -1)]);
  };
  const select = slot => {
    prepareMove();
    grid.current?.focus({ preventScroll: true });
    setOrder(previous => {
    const next = [...previous];
    [next[0], next[slot]] = [next[slot], next[0]];
    return next;
    });
  };
  const columns = photos.length === 2 || photos.length === 3 || photos.length === 6 ? 3 : 4;
  const tallCount = photos.length === 7 ? 0 : photos.length > 1 ? (columns - (photos.length + 3) % columns) % columns : 0;
  return <>
    <div ref={grid} className="event-photo-grid" data-count={visible.length} data-columns={columns}
      role="group" tabIndex={enabled ? 0 : -1}
      aria-label={enabled ? (de ? 'Fotogalerie. Wischen oder mit den Pfeiltasten blättern.' : 'Photo gallery. Swipe or use arrow keys to browse.') : (de ? 'Fotogalerie' : 'Photo gallery')}
      onKeyDown={event => {
        if (!enabled || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation(); step(event.key === 'ArrowRight' ? 1 : -1);
      }}
      onPointerDown={event => {
        if (!enabled || !event.isPrimary || event.button !== 0) return;
        event.stopPropagation(); suppressClick.current = false;
        pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
      }}
      onPointerMove={event => {
        const start = pointer.current;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (!start.horizontal && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { pointer.current = null; return; }
        if (!start.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          start.horizontal = true; event.currentTarget.setPointerCapture(event.pointerId);
        }
        if (start.horizontal) { event.preventDefault(); suppressClick.current = true; }
      }}
      onPointerUp={event => {
        const start = pointer.current; pointer.current = null;
        if (start?.horizontal && Math.abs(event.clientX - start.x) > 40) step(event.clientX < start.x ? 1 : -1);
      }}
      onPointerCancel={() => { pointer.current = null; }}
      onTouchStart={event => event.stopPropagation()}
      onTouchEnd={event => event.stopPropagation()}
      onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }}
      onWheel={event => {
        if (!enabled || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.stopPropagation();
        const gesture = wheel.current;
        if (event.timeStamp - gesture.last > 180) { gesture.distance = 0; gesture.changed = false; }
        gesture.last = event.timeStamp; gesture.distance += event.deltaX;
        if (!gesture.changed && Math.abs(gesture.distance) > 50) { step(gesture.distance > 0 ? 1 : -1); gesture.changed = true; }
      }}
    >
      {visible.map((image, slot) => {
        const tall = slot > 0 && slot <= tallCount;
        return <motion.button
        key={image.src}
        ref={node => {
          if (node) tiles.current.set(image.index, node);
          else tiles.current.delete(image.index);
        }}
        onLayoutAnimationStart={() => tiles.current.get(image.index)?.setAttribute('data-moving', '')}
        onLayoutAnimationComplete={() => tiles.current.get(image.index)?.removeAttribute('data-moving')}
        className={`event-photo-tile${slot === 0 ? ' event-photo-tile--main' : ''}`}
        data-photo-index={image.index}
        data-cover={image.isCover || undefined}
        data-tall={tall || undefined}
        type="button" disabled={!enabled}
        layout layoutId={`${galleryId}-${image.index}`}
        initial={false}
        animate={{opacity:image.isCover && !coverReady ? 0 : 1}}
        transition={reduceMotion ? { duration: 0 } : { layout: { type: 'spring', stiffness: 260, damping: 30 }, opacity:{duration:.24,ease:[.4,0,.2,1]} }}
        onClick={() => slot === 0 ? step(1) : select(slot)}
        aria-label={enabled ? `${slot === 0 ? (de ? 'Nächstes Bild anzeigen' : 'Show next image') : (de ? 'Als Hauptbild anzeigen' : 'Show as main image')}: ${image.alt}` : image.alt}
        style={{ borderRadius: 16, zIndex: slot === 0 ? 2 : 1 }}
      >
        <OptimizedImage src={image.src} alt={image.alt} loading="lazy" draggable={false}
          style={image.objectPosition ? { objectPosition: image.objectPosition } : image.cropTop ? { objectPosition: 'center bottom' } : undefined}/>
        {category && image.isCover && <ArticleBadge category={category} style={{ position: 'absolute', top: 16, right: 16 }}/>}
        {image.credit && <span className="event-image-credit">© {image.credit}</span>}
      </motion.button>;})}
    </div>
  </>;
}

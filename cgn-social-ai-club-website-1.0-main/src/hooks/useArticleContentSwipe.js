import { useCallback, useEffect, useState } from 'react';
import { animate } from 'framer-motion';

// Let native scrolling win unless a gesture starts at the top and moves down.
export default function useArticleContentSwipe(ref, offset, close) {
  const [expanded, setExpanded] = useState(false);
  const lowerOrClose = useCallback(() => {
    if (expanded) {
      setExpanded(false);
      animate(offset, 0, { type: 'spring', stiffness: 420, damping: 36 });
    } else close();
  }, [expanded, offset, close]);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let start = null;
    let dragging = false;
    let suppressClick = false;
    const begin = (event) => {
      suppressClick = false;
      start = event.touches.length === 1 && (!expanded || node.scrollTop <= 1) && window.matchMedia('(max-width: 767px)').matches
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
      dragging = false;
    };
    const move = (event) => {
      if (!start || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - start.x;
      const dy = event.touches[0].clientY - start.y;
      if (!dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dx) > Math.abs(dy)) { start = null; return; }
        if (dy < 0) {
          if (!expanded) { event.preventDefault(); setExpanded(true); }
          start = null;
          return;
        }
        dragging = true;
        suppressClick = true;
        offset.stop();
      }
      event.preventDefault();
      offset.set(Math.max(0, dy));
    };
    const finish = (event) => {
      if (dragging) {
        if (event.type !== 'touchcancel' && offset.get() > 70) lowerOrClose();
        else animate(offset, 0, { type: 'spring', stiffness: 420, damping: 36 });
      }
      start = null;
      dragging = false;
    };
    const expandOnScroll = () => {
      if (!expanded && node.scrollTop > 0 && window.matchMedia('(max-width: 767px)').matches) {
        setExpanded(true);
      }
    };
    const expandOnWheel = (event) => {
      if (!expanded && event.deltaY > 0 && window.matchMedia('(max-width: 767px)').matches) {
        event.preventDefault();
        setExpanded(true);
      }
    };
    const click = (event) => {
      if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    };
    node.addEventListener('scroll', expandOnScroll, { passive: true });
    node.addEventListener('wheel', expandOnWheel, { passive: false });
    node.addEventListener('touchstart', begin, { passive: true });
    node.addEventListener('touchmove', move, { passive: false });
    node.addEventListener('touchend', finish);
    node.addEventListener('touchcancel', finish);
    node.addEventListener('click', click, true);
    return () => {
      node.removeEventListener('scroll', expandOnScroll);
      node.removeEventListener('wheel', expandOnWheel);
      node.removeEventListener('touchstart', begin);
      node.removeEventListener('touchmove', move);
      node.removeEventListener('touchend', finish);
      node.removeEventListener('touchcancel', finish);
      node.removeEventListener('click', click, true);
    };
  }, [ref, offset, expanded, lowerOrClose]);
  return { expanded, lowerOrClose };
}

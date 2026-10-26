import { useLayoutEffect, useRef } from 'react';

// Align actual rendered rows, including the centered flex layout for upcoming events.
export default function useAlignedEventRows(view, locale) {
  const root = useRef(null);
  useLayoutEffect(() => {
    if (view !== 'cards' || !root.current) return;
    const element = root.current;
    let frame;
    let alive = true;
    const selectors = ['[data-event-part="title"]', '[data-event-part="date"]', '.event-location'];
    const align = () => {
      if (!alive) return;
      for (const grid of element.querySelectorAll('.event-cards,.project-article-grid')) {
        const cards = [...grid.querySelectorAll('.event-state-grid,.project-article-source')];
        for (const card of cards) for (const selector of selectors) {
          card.querySelector(selector)?.style.removeProperty('min-height');
        }
        const rows = [];
        for (const card of cards) {
          const top = card.getBoundingClientRect().top;
          let row = rows.find(row => Math.abs(row.top - top) < 2);
          if (!row) rows.push(row = { top, cards: [] });
          row.cards.push(card);
        }
        for (const row of rows) for (const selector of selectors) {
          const parts = row.cards.map(card => card.querySelector(selector)).filter(Boolean);
          const height = Math.max(0, ...parts.map(part => part.getBoundingClientRect().height));
          for (const part of parts) part.style.minHeight = `${height}px`;
        }
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(align); };
    let width = 0;
    const resize = new ResizeObserver(entries => {
      const next = entries[0].contentRect.width;
      if (next !== width) { width = next; schedule(); }
    });
    resize.observe(element);
    const content = new MutationObserver(schedule);
    content.observe(element, { childList: true, subtree: true, characterData: true });
    document.fonts?.ready.then(schedule);
    schedule();
    return () => { alive = false; cancelAnimationFrame(frame); resize.disconnect(); content.disconnect(); };
  }, [view, locale]);
  return root;
}

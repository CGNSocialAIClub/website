import { useCallback, useLayoutEffect, useRef } from 'react';

const origins = new Map();
export function rememberArticleCard(key, element) {
  origins.set(key, element);
}

// Animate a separate overlay surface: the source card never disappears or
// changes stacking order, and the closing surface stays in the portal layer.
export default function useArticleExpansion(ref, key, onDismiss, reducedMotion, sharedTransition = false) {
  const closing = useRef(false);
  const animation = useRef(null);
  const sourceTransform = useCallback(() => {
    const source = origins.get(key);
    if (!source?.isConnected || !ref.current) return null;
    const from = source.getBoundingClientRect();
    const to = ref.current.getBoundingClientRect();
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
  }, [key, ref]);

  useLayoutEffect(() => {
    const transform = sourceTransform();
    if (sharedTransition || reducedMotion || !transform) return;
    animation.current = ref.current.animate([
      { transform, transformOrigin: '0 0', opacity: 0.3 },
      { transform: 'none', transformOrigin: '0 0', opacity: 1 },
    ], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
    return () => animation.current?.cancel();
  }, [sourceTransform, reducedMotion, ref, sharedTransition]);

  return useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    animation.current?.cancel();
    const mobile = window.matchMedia('(max-width: 767px)').matches;
    const element = ref.current;
    if (sharedTransition && !mobile) { onDismiss(); return; }
    const transform = mobile && element
      ? `translateY(${window.innerHeight - element.getBoundingClientRect().top + element.offsetHeight}px)`
      : sourceTransform();
    if (!reducedMotion && transform && element) {
      const exit = element.animate([
        { transform: mobile ? getComputedStyle(element).transform : 'none', transformOrigin: '0 0', opacity: 1 },
        { transform, transformOrigin: '0 0', opacity: mobile ? 1 : 0 },
      ], { duration: mobile ? 280 : 240, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      try { await exit.finished; } catch { /* An interrupted dialog may already be gone. */ }
    }
    onDismiss();
  }, [sourceTransform, reducedMotion, ref, onDismiss, sharedTransition]);
}

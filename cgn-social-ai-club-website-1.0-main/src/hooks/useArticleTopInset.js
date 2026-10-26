import { useLayoutEffect, useState } from 'react';

// Keep article overlays below the visible navigation, including its banner gap.
export default function useArticleTopInset() {
  const [inset, setInset] = useState(112);
  useLayoutEffect(() => {
    const navigation = document.querySelector('.navbar-surface');
    const navigationLayer = document.querySelector('[data-persistent-navigation]');
    const banner = document.querySelector('[data-persistent-banner]');
    const previousNavigationStyle = navigationLayer?.getAttribute('style');
    const previousBannerStyle = banner?.getAttribute('style');
    // Elevate the existing navigation without resurrecting a scrolled-away banner.
    if (banner) banner.style.zIndex = '120';
    if (navigationLayer) navigationLayer.style.zIndex = '120';
    const measure = () => setInset(Math.max(12, Math.ceil(navigation?.getBoundingClientRect().bottom || 100) + 12));
    measure();
    const observer = new ResizeObserver(measure);
    if (navigation) observer.observe(navigation);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      for (const [node, style] of [[navigationLayer, previousNavigationStyle], [banner, previousBannerStyle]]) {
        if (!node) continue;
        if (style === null) node.removeAttribute('style');
        else node.setAttribute('style', style);
      }
    };
  }, []);
  return inset;
}

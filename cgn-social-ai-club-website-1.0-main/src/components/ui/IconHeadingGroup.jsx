import { useEffect, useRef } from 'react';

// Keep every title in a group at the same size, within the 48px icon height.
export default function IconHeadingGroup({ children, maxFontSize = 30, ...props }) {
    const group = useRef(null);

    useEffect(() => {
        const element = group.current;
        let disposed = false;
        let lastWidth;
        const fit = () => {
            if (disposed) return;
            const headings = [...element.querySelectorAll('.icon-aligned-heading')];
            const scale = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
            const minimum = 20 * scale;
            for (let size = maxFontSize * scale; size >= minimum; size -= scale) {
                headings.forEach(heading => {
                    heading.style.fontSize = `${size}px`;
                    heading.style.lineHeight = `${size * 1.1}px`;
                });
                if (headings.every(heading => heading.scrollHeight <= 48 * scale && heading.scrollWidth <= heading.clientWidth + 1)) break;
            }
        };
        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width === lastWidth) return;
            lastWidth = entry.contentRect.width;
            fit();
        });
        observer.observe(element);
        fit();
        document.fonts.ready.then(fit);
        return () => { disposed = true; observer.disconnect(); };
    }, [children, maxFontSize]);

    return <div {...props} ref={group}>{children}</div>;
}

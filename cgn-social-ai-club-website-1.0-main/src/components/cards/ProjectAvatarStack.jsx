import { useEffect, useRef, useState } from 'react';
import OptimizedImage from '../ui/OptimizedImage';
import AvatarPlaceholder from '../ui/AvatarPlaceholder';

export default function ProjectAvatarStack({ contributors, locale }) {
    const [active, setActive] = useState(0);
    const stack = useRef(null);
    const touchX = useRef(null);
    const wheelDistance = useRef(0);
    const lastWheel = useRef(0);
    const count = contributors.length;
    const select = index => setActive(Math.max(0, Math.min(count - 1, index)));

    useEffect(() => {
        const element = stack.current;
        if (!element || count < 2) return;
        const onWheel = event => {
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (!delta || event.ctrlKey) return;
            const direction = Math.sign(delta);
            if ((active === 0 && direction < 0) || (active === count - 1 && direction > 0)) return;
            event.preventDefault();
            event.stopPropagation();
            const now = Date.now();
            if (now - lastWheel.current > 180 || Math.sign(wheelDistance.current) !== direction) wheelDistance.current = 0;
            lastWheel.current = now;
            wheelDistance.current += delta;
            if (Math.abs(wheelDistance.current) >= 40) {
                setActive(index => Math.max(0, Math.min(count - 1, index + direction)));
                wheelDistance.current = 0;
            }
        };
        element.addEventListener('wheel', onWheel, { passive: false });
        return () => element.removeEventListener('wheel', onWheel);
    }, [active, count]);

    if (!count) return null;
    return <div ref={stack} className="project-card-avatars" role="group"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`, maxWidth: 48 + (count - 1) * 24 }}
        aria-label={locale === 'de' ? 'Projektteam – durch Scrollen oder mit Pfeiltasten auswählen' : 'Project team – scroll or use arrow keys to select'}
        onPointerLeave={event => { if (event.pointerType === 'mouse') select(0); }}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) select(0); }}
        onClick={event => event.stopPropagation()}
        onPointerDown={event => event.stopPropagation()}
        onTouchStart={event => { touchX.current = event.touches[0].clientX; event.stopPropagation(); }}
        onTouchMove={event => {
            if (touchX.current === null) return;
            const delta = touchX.current - event.touches[0].clientX;
            if (Math.abs(delta) >= 24) { select(active + Math.sign(delta)); touchX.current = event.touches[0].clientX; }
            event.stopPropagation();
        }}
        onTouchEnd={() => { touchX.current = null; }}
        onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault(); event.stopPropagation();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : Math.max(0, Math.min(count - 1, active + (event.key === 'ArrowRight' ? 1 : -1)));
            select(next);
            stack.current.querySelectorAll('button')[next]?.focus();
        }}>
        {contributors.map((person, index) => <button type="button" className="project-card-avatar" key={person.id}
            title={person.name} aria-label={person.name} aria-pressed={active === index} tabIndex={active === index ? 0 : -1}
            style={{ zIndex: count - Math.abs(active - index) }}
            onPointerEnter={event => { if (event.pointerType === 'mouse') select(index); }}
            onFocus={() => select(index)} onClick={() => select(index)}>
            {person.image ? <OptimizedImage src={person.image} alt="" sizes="48px" loading="lazy" draggable={false}
                style={{ objectPosition: `${((person.offsetX ?? 0) + 100) / 2}% ${((person.offsetY ?? 0) + 100) / 2}%` }}
                fallback={<AvatarPlaceholder size="100%" />} /> : <AvatarPlaceholder size="100%" />}
        </button>)}
    </div>;
}

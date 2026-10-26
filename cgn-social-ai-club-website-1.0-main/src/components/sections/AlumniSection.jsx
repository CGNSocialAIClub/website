import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Container from '../ui/Container';
import HeadingSection from '../ui/HeadingSection';
import TeamMemberCard from '../cards/TeamMemberCard';
import { useLocale } from '../../i18n/LocaleContext';
import './AlumniSection.css';

export default function AlumniSection({ members }) {
    const { t } = useLocale();
    const viewportRef = useRef(null);
    const firstGroupRef = useRef(null);
    const trackRef = useRef(null);
    const reducedMotion = useReducedMotion();

    const alumni = members.filter(member => member.id !== 'ruoxuancao').sort((a, b) =>
        Number(b.additionalRoles?.includes('Founding Team') || false)
        - Number(a.additionalRoles?.includes('Founding Team') || false)
        || a.name.localeCompare(b.name));
    useEffect(() => {
        const viewport = viewportRef.current;
        const firstGroup = firstGroupRef.current;
        const track = trackRef.current;
        if (!viewport || !firstGroup || !track || reducedMotion) return;

        let width = firstGroup.offsetWidth;
        let position = 0;
        let cruisingSpeed = width / Math.max(35, alumni.length * 8);
        let direction = 1;
        let velocity = cruisingSpeed;
        let hovered = viewport.matches(':hover');
        let focused = viewport.matches(':focus-visible');
        let pointer = null;
        let previousTime;
        let frame;
        const render = () => {
            if (!width) return;
            position = ((position % width) + width) % width;
            // Stay on the middle copy, leaving a complete cycle on either side.
            // Translate at fractional pixels; scrollLeft rounds slow movement into visible steps.
            track.style.transform = `translate3d(${-width - position}px, 0, 0)`;
        };
        const measure = () => {
            const nextWidth = firstGroup.offsetWidth;
            position = width ? position / width * nextWidth : 0;
            width = nextWidth;
            cruisingSpeed = width / Math.max(35, alumni.length * 8);
            render();
        };
        const observer = new ResizeObserver(measure);
        observer.observe(firstGroup);
        const advance = time => {
            const dt = previousTime === undefined ? 0 : Math.min(time - previousTime, 50) / 1000;
            previousTime = time;
            if (!pointer?.dragging) {
                const target = hovered || focused ? 0 : direction * cruisingSpeed;
                const easingTime = target === 0 ? 0.25 : 0.45;
                const decay = Math.exp(-dt / easingTime);
                position += target * dt + (velocity - target) * easingTime * (1 - decay);
                velocity = target + (velocity - target) * decay;
                render();
            }
            frame = requestAnimationFrame(advance);
        };
        const enter = event => { if (event.pointerType !== 'touch') hovered = true; };
        const leave = () => { hovered = false; };
        const focus = () => { focused = viewport.matches(':focus-visible'); };
        const blur = event => { focused = viewport.contains(event.relatedTarget); };
        const down = event => {
            if (!event.isPrimary || event.button !== 0) return;
            focused = false;
            pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, time: event.timeStamp, dragging: false };
        };
        const move = event => {
            if (!pointer || pointer.id !== event.pointerId) return;
            if (!pointer.dragging) {
                const dx = event.clientX - pointer.x;
                if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(event.clientY - pointer.y)) return;
                pointer.dragging = true;
                viewport.setPointerCapture(event.pointerId);
            }
            const delta = pointer.lastX - event.clientX;
            position += delta;
            if (Math.abs(delta) > 0.5) {
                direction = Math.sign(delta);
                const measured = Math.abs(delta) / (Math.max(8, event.timeStamp - pointer.time) / 1000);
                velocity = direction * Math.min(cruisingSpeed * 10, Math.max(cruisingSpeed, measured * 0.7 + Math.abs(velocity) * 0.3));
            }
            pointer.lastX = event.clientX;
            pointer.time = event.timeStamp;
            render();
        };
        const up = event => {
            if (pointer?.id !== event.pointerId) return;
            if (pointer.dragging && event.timeStamp - pointer.time > 100) velocity = 0;
            pointer = null;
        };
        const wheel = event => {
            if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
            event.preventDefault();
            const delta = event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
            const nextDirection = Math.sign(delta) || direction;
            const carriedSpeed = nextDirection === direction ? Math.abs(velocity) : 0;
            direction = nextDirection;
            velocity = direction * Math.min(cruisingSpeed * 10, Math.max(cruisingSpeed, carriedSpeed, Math.abs(delta) * 35));
        };
        const key = event => {
            if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
            event.preventDefault();
            direction = event.key === 'ArrowLeft' ? -1 : 1;
            velocity = direction * Math.min(cruisingSpeed * 10, Math.max(cruisingSpeed, Math.abs(velocity)) + 200);
        };
        const preventDrag = event => event.preventDefault();
        const listeners = [['pointerenter', enter], ['pointerleave', leave], ['focusin', focus], ['focusout', blur],
            ['pointerdown', down], ['pointermove', move], ['wheel', wheel], ['keydown', key], ['dragstart', preventDrag]];
        listeners.forEach(([name, handler]) => viewport.addEventListener(name, handler, { passive: false }));
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        render();
        frame = requestAnimationFrame(advance);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
            listeners.forEach(([name, handler]) => viewport.removeEventListener(name, handler));
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
            track.style.transform = '';
        };
    }, [alumni.length, reducedMotion]);

    if (!alumni.length) return null;
    return (
        <section className="alumni-section w-full section-block" aria-labelledby="alumni-title">
            <Container>
                <div id="alumni-title">
                    <HeadingSection title={t.pages.community.alumniTitle} subtitle={t.pages.community.alumniSubtitle} />
                </div>
                <div className="alumni-window" style={{ '--alumni-count': alumni.length }}>
                <div ref={viewportRef} className="alumni-viewport" tabIndex={0} role="group" aria-label={t.pages.community.alumniTitle}>
                    <div ref={trackRef} className="alumni-track">
                        {[0, 1, 2].map(group => (
                            <div ref={group === 0 ? firstGroupRef : undefined} className="alumni-group" key={group} aria-hidden={group > 0 ? true : undefined} inert={group > 0 ? true : undefined}>
                                {alumni.map(member => (
                                    <div className="alumni-card" key={member.id}>
                                        <TeamMemberCard
                                            member={{
                                                ...member,
                                                additionalRoles: [],
                                                role: 'Alumni',
                                            }}
                                            interactive={false}
                                            imageLoading="eager"
                                            showRole
                                            showDepartment={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            </Container>
        </section>
    );
}

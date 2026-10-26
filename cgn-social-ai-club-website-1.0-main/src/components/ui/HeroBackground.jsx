import OptimizedImage from './OptimizedImage.jsx';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function HeroBackground() {
    const reducedMotion = useReducedMotion();
    const containerRef = useRef(null);
    const posterRef = useRef(null);
    const videoRef = useRef(null);
    const [posterReady, setPosterReady] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (posterRef.current?.complete && posterRef.current.naturalWidth) setPosterReady(true);
    }, []);

    useEffect(() => {
        setPlaying(false);
        // Wait for the accessibility preference and the priority image first.
        if (reducedMotion !== false || !posterReady) return;

        const video = videoRef.current;
        const connection = navigator.connection;
        const controller = new AbortController();
        let disposed = false;
        let failed = false;
        let visible = false;
        let started = false;
        let objectUrl;
        let timeout;
        const saveData = () => connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType);
        const stop = () => {
            failed = true;
            clearTimeout(timeout);
            controller.abort();
            video.pause();
            video.removeAttribute('src');
            video.load();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrl = undefined;
            if (!disposed) setPlaying(false);
        };
        const syncPlayback = () => {
            if (disposed || failed) return;
            if (saveData()) { stop(); return; }
            if (!visible || document.hidden) { video.pause(); return; }
            if (objectUrl && video.readyState >= 2) {
                video.play().catch((error) => {
                    // Scrolling away can interrupt an otherwise valid play request.
                    if (!disposed && error.name !== 'AbortError') stop();
                });
            }
        };
        const startDownload = async () => {
            if (started || failed || disposed || !visible || document.hidden) return;
            if (saveData()) { stop(); return; }
            started = true;
            timeout = setTimeout(stop, 20000);
            try {
                const mobile = window.matchMedia('(max-width: 767px)').matches;
                const response = await fetch(`/assets/club/demo-day-group-hero-${mobile ? 'mobile' : 'loop-slow'}.mp4`, { signal: controller.signal });
                if (!response.ok) throw new Error('Video unavailable');
                // A complete local blob prevents network buffering during playback.
                const blob = await response.blob();
                if (disposed || failed) return;
                clearTimeout(timeout);
                objectUrl = URL.createObjectURL(blob);
                video.src = objectUrl;
                video.load();
            } catch {
                if (!disposed) stop();
            }
        };
        const update = () => { syncPlayback(); void startDownload(); };
        const reveal = () => { if (!disposed && !failed) setPlaying(true); };
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            update();
        });
        video.addEventListener('loadeddata', syncPlayback);
        video.addEventListener('playing', reveal);
        video.addEventListener('error', stop);
        document.addEventListener('visibilitychange', update);
        connection?.addEventListener('change', update);
        observer.observe(containerRef.current);
        return () => {
            disposed = true;
            observer.disconnect();
            video.removeEventListener('loadeddata', syncPlayback);
            video.removeEventListener('playing', reveal);
            video.removeEventListener('error', stop);
            document.removeEventListener('visibilitychange', update);
            connection?.removeEventListener('change', update);
            stop();
        };
    }, [posterReady, reducedMotion]);

    return (
        <div ref={containerRef} aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden bg-[var(--hero-base)]">
            <div className="photo-hero-image absolute inset-0">
                <OptimizedImage sizes="100vw" ref={posterRef} src="/assets/club/demo-day-group-hero-poster.jpg" alt="" fetchPriority="high" loading="eager" onLoad={() => setPosterReady(true)} className="absolute inset-0 h-full w-full object-cover object-bottom" />
                <video ref={videoRef} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover object-bottom transition-opacity duration-500 motion-reduce:transition-none" style={{ opacity: playing && !reducedMotion ? 1 : 0 }} />
            </div>
            <div className="absolute inset-0" style={{ background: 'var(--hero-overlay)' }} />
        </div>
    );
}

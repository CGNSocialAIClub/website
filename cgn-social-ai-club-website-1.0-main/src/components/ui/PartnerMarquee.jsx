import { useEffect, useRef, useState } from 'react';
import SectionLabel from './SectionLabel';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

// Logos hier eintragen wenn Partner vorhanden sind.
// Datei ablegen in: public/cms/all-partner-logos/<dateiname>
// Format: { src: assetUrl('/cms/all-partner-logos/<dateiname>'), alt: 'Name', heightClass: 'h-12' }
const logos = [
    { src: assetUrl('/cms/all-partner-logos/initiative-gruppe-blue.svg'), alt: 'Initiative Gruppe', heightClass: 'h-14' },
    { src: assetUrl('/cms/all-partner-logos/entreculturas-blue.svg'), alt: 'Entreculturas', heightClass: 'h-10' },
    { src: assetUrl('/cms/all-partner-logos/openai-blue.svg'), alt: 'OpenAI', heightClass: 'h-12' },
    { src: assetUrl('/cms/all-partner-logos/kulturator-blue.svg'), alt: 'Kulturator' },
    { src: assetUrl('/cms/all-partner-logos/knowunity-blue.svg'), alt: 'Knowunity', heightClass: 'h-12' },
    { src: assetUrl('/cms/all-partner-logos/aws-blue.svg'), alt: 'AWS', heightClass: 'h-14' },
    { src: assetUrl('/cms/all-partner-logos/un-women-blue.svg'), alt: 'UN Women', heightClass: 'h-12' },
];

export default function PartnerMarquee() {
    const { t } = useLocale();
    const [isDark, setIsDark] = useState(false);
    const [groupWidth, setGroupWidth] = useState(0);
    const [duplicateCount, setDuplicateCount] = useState(3);
    const [isHovered, setIsHovered] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const containerRef = useRef(null);
    const firstGroupRef = useRef(null);
    const trackRef = useRef(null);
    const animationFrameRef = useRef(null);
    const offsetRef = useRef(0);
    const speedRef = useRef(0);
    const lastFrameTimeRef = useRef(null);

    useEffect(() => {
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkDark();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkDark();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const updateMotionPreference = () => {
            setPrefersReducedMotion(mediaQuery.matches);
        };

        updateMotionPreference();
        mediaQuery.addEventListener('change', updateMotionPreference);

        return () => mediaQuery.removeEventListener('change', updateMotionPreference);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        const firstGroup = firstGroupRef.current;

        if (!container || !firstGroup) {
            return undefined;
        }

        const updateMeasurements = () => {
            const nextGroupWidth = firstGroup.offsetWidth;
            const containerWidth = container.offsetWidth;

            if (!nextGroupWidth || !containerWidth) {
                return;
            }

            setGroupWidth(nextGroupWidth);
            setDuplicateCount(Math.max(2, Math.ceil(containerWidth / nextGroupWidth) + 2));
        };

        updateMeasurements();

        const resizeObserver = new ResizeObserver(updateMeasurements);
        resizeObserver.observe(container);
        resizeObserver.observe(firstGroup);

        window.addEventListener('resize', updateMeasurements);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateMeasurements);
        };
    }, []);

    useEffect(() => {
        const track = trackRef.current;

        if (!track) {
            return undefined;
        }

        if (prefersReducedMotion || !groupWidth) {
            track.style.transform = 'translate3d(0, 0, 0)';
            offsetRef.current = 0;
            speedRef.current = 0;
            lastFrameTimeRef.current = null;
            return undefined;
        }

        const normalSpeed = 36;
        const hoverSpeed = 16;
        const speedLerp = 0.08;

        const animate = (timestamp) => {
            if (lastFrameTimeRef.current == null) {
                lastFrameTimeRef.current = timestamp;
            }

            const deltaMs = timestamp - lastFrameTimeRef.current;
            lastFrameTimeRef.current = timestamp;
            const targetSpeed = isHovered ? hoverSpeed : normalSpeed;

            speedRef.current += (targetSpeed - speedRef.current) * speedLerp;
            offsetRef.current -= speedRef.current * (deltaMs / 1000);

            if (offsetRef.current <= -groupWidth) {
                offsetRef.current += groupWidth;
            }

            track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
            animationFrameRef.current = window.requestAnimationFrame(animate);
        };

        animationFrameRef.current = window.requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                window.cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            lastFrameTimeRef.current = null;
        };
    }, [groupWidth, isHovered, prefersReducedMotion]);

    const getLogoStyle = (isHovered) => {
        if (isDark) {
            if (isHovered) {
                return { filter: 'brightness(0) saturate(100%) invert(86%) sepia(21%) saturate(921%) hue-rotate(102deg) brightness(101%) contrast(106%)' };
            }
            return { filter: 'brightness(0) invert(0.85)' };
        }

        if (isHovered) {
            return { filter: 'grayscale(0)' };
        }
        return { filter: 'grayscale(1)' };
    };

    return (
        <div className="w-full pt-6 pb-2 overflow-hidden">
            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="flex flex-col items-center mb-2">
                    <SectionLabel>{t.home.partnersLabel}</SectionLabel>
                </div>
                <div
                    ref={containerRef}
                    className="partner-marquee relative w-full overflow-hidden py-3 md:py-4"
                    style={{
                        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div
                        ref={trackRef}
                        className="partner-marquee-track flex w-max items-center"
                    >
                        {Array.from({ length: duplicateCount }, (_, groupIndex) => (
                            <div
                                key={groupIndex}
                                ref={groupIndex === 0 ? firstGroupRef : null}
                                className="partner-marquee-group flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12 md:gap-16 md:pr-16"
                                aria-hidden={groupIndex > 0}
                            >
                                {logos.map((logo) => (
                                    <LogoItem key={`${groupIndex}-${logo.alt}`} logo={logo} getLogoStyle={getLogoStyle} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LogoItem({ logo, getLogoStyle }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex-shrink-0 flex items-center justify-center h-20 sm:h-24 transition-all duration-300 opacity-70 hover:opacity-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={logo.src}
                alt={logo.alt}
                className={`${logo.heightClass || 'h-16'} w-auto object-contain pointer-events-none select-none transition-all duration-300`}
                style={getLogoStyle(isHovered)}
                loading="lazy"
                decoding="async"
            />
        </div>
    );
}

import OptimizedImage from './OptimizedImage.jsx';
import { motion, useReducedMotion } from 'framer-motion';

export default function ClubPhoto({ name, alt, className = '', position = 'center' }) {
    const reducedMotion = useReducedMotion();
    return (
        <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className={`club-photo group overflow-hidden rounded-3xl bg-[var(--bg-surface-subtle)] ${className}`}
        >
            <OptimizedImage
                src={`/assets/club/${name}-1400.jpg`}
                srcSet={`/assets/club/${name}-700.jpg 700w, /assets/club/${name}-1400.jpg 1400w`}
                sizes="(max-width: 767px) 100vw, 55vw"
                alt={alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: position }}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:transform-none"
            />
        </motion.div>
    );
}

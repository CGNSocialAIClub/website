import { motion, useIsPresent, useReducedMotion } from 'framer-motion';
import LanguageToggle from './LanguageToggle';

export default function NavbarLanguageToggle() {
    const isPresent = useIsPresent();
    const reducedMotion = useReducedMotion();
    return (
        <motion.div
            className="absolute left-1 top-1/2 h-[48.2px] w-[94px] -translate-y-1/2 overflow-hidden"
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeInOut' }}
            style={{ pointerEvents: isPresent ? 'auto' : 'none' }}
            aria-hidden={!isPresent}
            inert={!isPresent}
        >
            <LanguageToggle navbar />
        </motion.div>
    );
}

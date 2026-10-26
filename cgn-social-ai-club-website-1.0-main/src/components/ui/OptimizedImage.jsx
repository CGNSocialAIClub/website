import { useState } from 'react';
import { landscapeSource } from './imageFallbacks';
import images from '../../data/optimizedImages.json';

// Render a plain img so existing layout, refs, error placeholders and logo
// animation selectors keep working. A failed WebP retries the original once.
export default function OptimizedImage({ src, srcSet, sizes, onError, fallback, as: Image = 'img', ...props }) {
    const [failedSource, setFailedSource] = useState(null);
    const [unavailableSource, setUnavailableSource] = useState(null);
    const optimized = failedSource !== src ? images[src] : null;
    const variants = optimized?.variants;
    const unavailable = !src || unavailableSource === src;
    const useLandscape = unavailable && fallback === undefined && !onError;
    return <><Image
        {...props}
        style={unavailable && !useLandscape ? { ...props.style, display: 'none' } : useLandscape ? { ...props.style, objectFit: 'cover', objectPosition: 'center', padding: 0 } : props.style}
        src={useLandscape ? landscapeSource : variants ? variants.at(-1).src : src}
        srcSet={unavailable ? undefined : variants ? variants.map(image => `${image.src} ${image.width}w`).join(', ') : srcSet}
        sizes={variants ? sizes || '(max-width: 767px) 100vw, 50vw' : sizes}
        onError={event => {
            if (unavailable) return;
            if (variants) setFailedSource(src);
            else {
                setUnavailableSource(src);
                onError?.(event);
            }
        }}
    />{unavailable ? fallback : null}</>;
}

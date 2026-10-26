import OptimizedImage from './OptimizedImage.jsx';
import React, { useState, useEffect } from 'react';
import { assetUrl } from '../../utils/assetUrl';

export default function Logo({ className = "h-8", iconOnly = false, stacked = false, v6Full = false, heroMobile = false, navbarSingleLine = false, heroDesktopSingleLine = false, navbarText = false, fullWidth = false, onError }) {
    const [isDark, setIsDark] = useState(false);
    const [loadedSource, setLoadedSource] = useState(null);

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

    // Choose image based on props and theme
    const src = assetUrl(navbarText
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-single-line-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-single-line-dark-text.svg"
        )
        : heroDesktopSingleLine
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-hero-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-hero-dark-text.svg"
        )
        : navbarSingleLine
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Icon-No-Background-White-Text.svg"
            : "/assets/logos/CGN-Social-AI-Icon-No-Background-Dark-Text.svg"
        )
        : v6Full
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-full-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-full-dark-text.svg"
        )
        : heroMobile
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-single-line-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-single-line-dark-text.svg"
        )
        : stacked
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-stacked-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-stacked-dark-text.svg"
        )
        : iconOnly
            ? (isDark
                ? "/assets/logos/CGN-Social-AI-Icon-No-Background-White-Text.svg"
                : "/assets/logos/CGN-Social-AI-Icon-No-Background-Dark-Text.svg"
            )
            : (isDark
                ? "/assets/logos/CGN-Social-AI-Club-full-white-text.svg"
                : "/assets/logos/CGN-Social-AI-Club-full-dark-text.svg"
            ));

    const imgClassName = fullWidth ? "w-full h-auto" : "h-full w-auto";

    return (
        <div className={`relative ${className}`}>
            <OptimizedImage
                key={src}
                src={src}
                alt="CGN Social AI Club Logo"
                className={imgClassName}
                width={navbarText ? 2191 : iconOnly ? 500 : undefined}
                height={navbarText ? 182 : iconOnly ? 500 : undefined}
                style={{ visibility: loadedSource === src ? 'visible' : 'hidden' }}
                loading={onError ? 'eager' : 'lazy'}
                onLoad={() => setLoadedSource(src)}
                onError={onError}
                fallback={onError ? undefined : <span aria-label="CGN Social AI Club" style={{ display: 'block', fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 'clamp(18px, 4vw, 34px)', lineHeight: 1 }}>
                    {stacked || v6Full ? <>CGN<br />SOCIAL AI<br />CLUB</> : 'CGN SOCIAL AI CLUB'}
                </span>}
            />
        </div>
    );
}

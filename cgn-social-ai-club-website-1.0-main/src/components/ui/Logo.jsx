import React, { useState, useEffect } from 'react';

export default function Logo({ className = "h-8", iconOnly = false, stacked = false, v6Full = false, heroMobile = false, navbarSingleLine = false, heroDesktopSingleLine = false, navbarText = false, fullWidth = false }) {
    const [isDark, setIsDark] = useState(false);

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
    const src = navbarText
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-single-line-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-single-line-dark-text.svg"
        )
        : heroDesktopSingleLine
        ? (isDark
            ? "/assets/logos/CGN-Social-AI-Club-single-line-white-text.svg"
            : "/assets/logos/CGN-Social-AI-Club-single-line-dark-text.svg"
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
            );

    const imgClassName = fullWidth ? "w-full h-auto" : "h-full w-auto";

    return (
        <div className={`relative ${className}`}>
            <img
                src={src}
                alt="CGN Social AI Club Logo"
                className={imgClassName}
                loading="lazy"
            />
        </div>
    );
}

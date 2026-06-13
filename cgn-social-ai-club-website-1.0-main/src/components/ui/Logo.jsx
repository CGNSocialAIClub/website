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
            ? "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-white_text.svg"
            : "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-dark_text.svg"
        )
        : heroDesktopSingleLine
        ? (isDark
            ? "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-white_text.svg"
            : "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-dark_text.svg"
        )
        : navbarSingleLine
        ? (isDark
            ? "/assets/logos/LOGO_V6-ICON+TUM_SOCIAL_CLUB-single_line-white_text.svg"
            : "/assets/logos/LOGO_V6-ICON+TUM_SOCIAL_CLUB-single_line-dark_text.svg"
        )
        : v6Full
        ? (isDark
            ? "/assets/logos/LOGO-V6-ICON+TUM-SOCIAL-CLUB-white-text.svg"
            : "/assets/logos/LOGO-V6-ICON+TUM-SOCIAL-CLUB-dark-text.svg"
        )
        : heroMobile
        ? (isDark
            ? "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-white_text.svg"
            : "/assets/logos/LOGO_V6-TUM_SOCIAL_CLUB-single_line-dark_text.svg"
        )
        : stacked
        ? (isDark
            ? "/assets/logos/LOGO_V6-ICON+TUM-SOCIAL-CLUB_stacked-white-text.svg"
            : "/assets/logos/LOGO_V6-ICON+TUM-SOCIAL-CLUB_stacked-dark-text.svg"
        )
        : iconOnly
            ? (isDark
                ? "/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-White-Text.svg"
                : "/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-Darkblue-Text.svg"
            )
            : (isDark
                ? "/assets/logos/LOGO-v5-SOCIAL-AI_ICON+TUM+TEXT_No-Background-White-Text.svg"
                : "/assets/logos/LOGO-v5-SOCIAL-AI_ICON+TUM+TEXT_No-Background-Darkblue-Text.svg"
            );

    const imgClassName = fullWidth ? "w-full h-auto" : "h-full w-auto";

    return (
        <div className={`relative ${className}`}>
            <img
                src={src}
                alt="TUM Social AI Club Logo"
                className={imgClassName}
                loading="lazy"
            />
        </div>
    );
}

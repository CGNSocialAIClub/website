import { useState, useEffect } from 'react';
import { useLocale } from '../../i18n/LocaleContext';

// Sponsor tier config (fancy metallic backgrounds)
const sponsorTierConfig = {
    gold: {
        bg: '/assets/sponsor-backgrounds/GoldSponsor-Background.jpeg',
        label: {
            en: 'Gold Partner',
            de: 'Gold Partner',
        },
        textColor: 'text-[#8B7500]',
        borderColor: 'border-[#FFD700]/30',
    },
    silver: {
        bg: '/assets/sponsor-backgrounds/SilverSponsor-Background.jpeg',
        label: {
            en: 'Silver Partner',
            de: 'Silver Partner',
        },
        textColor: 'text-[#696969]',
        borderColor: 'border-[#C0C0C0]/30',
    },
    bronze: {
        bg: '/assets/sponsor-backgrounds/BronzeSponsor-Background.jpeg',
        label: {
            en: 'Bronze Partner',
            de: 'Bronze Partner',
        },
        textColor: 'text-[#8B4513]',
        borderColor: 'border-[#CD7F32]/30',
    },
};

const LOGO_CONTAINER_CLASS = 'absolute inset-0 z-10 flex items-center justify-center';
const LOGO_IMAGE_CLASS = 'w-full h-full max-w-[80%] max-h-[30%] object-contain';

function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains('dark'));

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDarkMode(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    return isDarkMode;
}

// ─── Sponsor variant (gold, silver, bronze) ───
// Fancy metallic hover background, large card
function SponsorCard({ tier, name, logo, logoDark }) {
    const { locale } = useLocale();
    const config = sponsorTierConfig[tier] || sponsorTierConfig.silver;
    const [isHovered, setIsHovered] = useState(false);
    const isDarkMode = useDarkMode();
    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    return (
        <div
            className={`relative w-full aspect-[3/2] rounded-3xl overflow-hidden bg-[var(--bg-surface)] shadow-lg hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_40px_rgba(0,0,0,0.1)] transition-all duration-500 group border ${config.borderColor}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Metallic Background (Revealed on Hover) */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-500 ease-in-out"
                style={{
                    backgroundImage: `url(${config.bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: isHovered ? 1 : 0
                }}
            />

            {/* Label */}
            <div className="absolute top-4 left-4 z-20">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm shadow-sm ${config.textColor}`}>
                    {config.label[locale] || config.label.en}
                    </span>
            </div>

            {/* Logo Container */}
            <div className={LOGO_CONTAINER_CLASS}>
                {displayLogo ? (
                    <img
                        src={displayLogo}
                        alt={`${name} Logo`}
                        className={`${LOGO_IMAGE_CLASS} transition-all duration-500`}
                        loading="lazy"
                    />
                ) : (
                    <div className={`text-2xl font-bold opacity-30 ${isHovered ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                        {name}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Supporter variant ───
// Simple, smaller card with no fancy background
function SupporterCard({ name, logo, logoDark }) {
    const { locale } = useLocale();
    const isDarkMode = useDarkMode();
    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    return (
        <div
            className="relative w-full max-w-[420px] aspect-[3/2] rounded-3xl overflow-hidden bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--border-default)] flex flex-col items-center justify-center"
        >
            {/* Label */}
            <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
                    {locale === 'de' ? 'Supporter' : 'Supporter'}
                </span>
            </div>

            {/* Logo / Name */}
            <div className={LOGO_CONTAINER_CLASS}>
                {displayLogo ? (
                    <img
                        src={displayLogo}
                        alt={`${name} Logo`}
                        className={LOGO_IMAGE_CLASS}
                        loading="lazy"
                    />
                ) : (
                    <div className="text-xl font-semibold text-[var(--text-secondary)]">
                        {name}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Social Partner variant ───
// Horizontal card with logo + name + description
function SocialPartnerCard({ name, logo, logoDark, logoFallback, description }) {
    const { locale } = useLocale();
    const isDarkMode = useDarkMode();
    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    return (
        <div
            className="relative w-full max-w-[420px] aspect-[3/2] rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E7EB] flex flex-col items-center justify-center"
        >
            {/* Label */}
            <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
                    {locale === 'de' ? 'Sozialpartner' : 'Social Partner'}
                </span>
            </div>

            {/* Logo / Name */}
            <div className={LOGO_CONTAINER_CLASS}>
                {displayLogo ? (
                    <img
                        src={displayLogo}
                        alt={`${name} Logo`}
                        className={LOGO_IMAGE_CLASS}
                        loading="eager"
                        onError={(e) => {
                            if (logoFallback) e.target.src = logoFallback;
                        }}
                    />
                ) : (
                    <div className="text-xl font-semibold text-[#6B7280]">
                        {name}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Unified PartnerCard ───
// variant: 'sponsor' | 'supporter' | 'social'
// tier (sponsor only): 'gold' | 'silver' | 'bronze'
export default function PartnerCard({ variant = 'sponsor', tier, name, logo, logoDark, logoFallback, description }) {
    if (variant === 'supporter') {
        return <SupporterCard name={name} logo={logo} logoDark={logoDark} />;
    }

    if (variant === 'social') {
        return <SocialPartnerCard name={name} logo={logo} logoDark={logoDark} logoFallback={logoFallback} description={description} />;
    }

    // Default: sponsor (fancy)
    return <SponsorCard tier={tier} name={name} logo={logo} logoDark={logoDark} />;
}

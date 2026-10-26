import './PartnerCard.css';
import PartnerLogoFallback from '../ui/PartnerLogoFallback';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import { useState, useEffect } from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

// Sponsor tier config (fancy metallic backgrounds)
const sponsorTierConfig = {
    partner: {
        bg: assetUrl('/assets/sponsor-backgrounds/SilverSponsor-Background.jpeg'),
        label: {
            en: 'Partner',
            de: 'Partner',
        },
        textColor: 'text-[#696969]',
        borderColor: 'border-[#C0C0C0]/30',
    },
    gold: {
        bg: assetUrl('/assets/sponsor-backgrounds/GoldSponsor-Background.jpeg'),
        label: {
            en: 'Gold Partner',
            de: 'Gold Partner',
        },
        textColor: 'text-[#8B7500]',
        borderColor: 'border-[#FFD700]/30',
    },
    silver: {
        bg: assetUrl('/assets/sponsor-backgrounds/SilverSponsor-Background.jpeg'),
        label: {
            en: 'Silver Partner',
            de: 'Silver Partner',
        },
        textColor: 'text-[#696969]',
        borderColor: 'border-[#C0C0C0]/30',
    },
    bronze: {
        bg: assetUrl('/assets/sponsor-backgrounds/BronzeSponsor-Background.jpeg'),
        label: {
            en: 'Bronze Partner',
            de: 'Bronze Partner',
        },
        textColor: 'text-[#8B4513]',
        borderColor: 'border-[#CD7F32]/30',
    },
};

const SPONSOR_LOGO_CONTAINER_CLASS = 'absolute inset-x-0 bottom-0 top-[var(--partner-badge-inset)] z-10 flex items-center justify-center';
const LOGO_CONTAINER_CLASS = 'absolute inset-0 z-10 flex translate-y-[3%] items-center justify-center';
const LOGO_IMAGE_CLASS = 'w-full h-full max-w-[80%] max-h-[30%] object-contain';
// For logos with a compact shape (e.g. icon + short word) that would otherwise look small in the card.
const LOGO_IMAGE_CLASS_TALL = 'w-full h-full max-w-[80%] max-h-[52%] object-contain';

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

function PartnerCardLink({ website, name, children }) {
    if (!website) {
        return children;
    }

    return (
        <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name} website in a new tab`}
            className="block partner-card-shape focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-primary)]"
        >
            {children}
        </a>
    );
}

// ─── Sponsor variant (gold, silver, bronze) ───
// Fancy metallic hover background, large card
function SponsorCard({ tier, name, logo, logoDark, logoFit, showMetallicBackground = false, useCenteredHighlight = false }) {
    const { locale } = useLocale();
    const config = sponsorTierConfig[tier] || sponsorTierConfig.silver;
    const [isHovered, setIsHovered] = useState(false);
    const isDarkMode = useDarkMode();
    // The metallic highlight is light, so it keeps the dark-text logo even in dark mode.
    const isHighlighted = showMetallicBackground || (!useCenteredHighlight && isHovered);
    const displayLogo = isDarkMode && logoDark && !isHighlighted ? logoDark : logo;

    return (
        <div
            className={`relative w-full aspect-[3/2] partner-card-shape partner-card--sponsor overflow-hidden bg-[var(--bg-surface)] shadow-lg hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),inset_0_0_40px_rgba(0,0,0,0.1)] transition-all duration-500 group border ${config.borderColor}`}
            data-highlighted={showMetallicBackground || (!useCenteredHighlight && isHovered)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Metallic Background (hovered on desktop, centered on mobile) */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-[600ms] ease-in-out motion-reduce:transition-none"
                style={{
                    backgroundImage: `url(${config.bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: showMetallicBackground || (!useCenteredHighlight && isHovered) ? 1 : 0
                }}
            />

            {/* Label */}
            <div className="absolute left-[var(--partner-badge-inset)] top-[var(--partner-badge-inset)] z-20 flex leading-none">
                    <span className={`partner-tier-badge inline-flex h-[var(--partner-badge-height)] items-center rounded-full font-bold uppercase tracking-wider border ${config.borderColor} ${config.textColor}`}>
                    <span className="partner-badge-text">{config.label[locale] || config.label.en}</span>
                    </span>
            </div>

            {/* Logo Container */}
            <div className={SPONSOR_LOGO_CONTAINER_CLASS}>
                {displayLogo ? (
                    <OptimizedImage
                        src={displayLogo}
                        alt={`${name} Logo`}
                        fallback={<PartnerLogoFallback name={name} />}
                        className={`${logoFit === 'tall' ? LOGO_IMAGE_CLASS_TALL : LOGO_IMAGE_CLASS} transition-all duration-500`}
                        loading="lazy"
                    />
                ) : (
                    <PartnerLogoFallback name={name} />
                )}
            </div>
        </div>
    );
}

// ─── Supporter variant ───
// Simple, smaller card with no fancy background
function SupporterCard({ name, logo, logoDark, wordmark }) {
    const isDarkMode = useDarkMode();
    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    return (
        <div
            className="relative w-full max-w-[420px] aspect-[3/2] partner-card-shape partner-card--supporter overflow-hidden bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--border-default)] flex flex-col items-center justify-center"
            style={{
                '--partner-badge-height': '12.676056cqw',
            }}
        >
            {/* Label */}
            <div className="absolute left-[var(--partner-badge-inset)] top-[var(--partner-badge-inset)] z-20 flex leading-none">
                <span className="inline-flex h-[var(--partner-badge-height)] items-center partner-supporter-badge rounded-full border border-[var(--border-default)] font-bold uppercase tracking-wide bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)]">
                    <span className="partner-badge-text">Supporter</span>
                </span>
            </div>

            {/* Logo / Name */}
            <div className={SPONSOR_LOGO_CONTAINER_CLASS}>
                {wordmark ? (
                    <span className="text-2xl font-medium text-[var(--text-primary)]">
                        {wordmark}
                    </span>
                ) : displayLogo ? (
                    <OptimizedImage
                        src={displayLogo}
                        alt={`${name} Logo`}
                        fallback={<PartnerLogoFallback name={name} />}
                        className={LOGO_IMAGE_CLASS}
                        loading="lazy"
                    />
                ) : (
                    <PartnerLogoFallback name={name} />
                )}
            </div>
        </div>
    );
}

// ─── Social Partner variant ───
// Horizontal card with logo + name + description
function SocialPartnerCard({ name, logo, logoDark, logoFallback, description }) {
    const isDarkMode = useDarkMode();
    const displayLogo = isDarkMode && logoDark ? logoDark : logo;

    return (
        <div
            className="relative w-full max-w-[420px] aspect-[3/2] partner-card-shape partner-card--social overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E7EB] flex flex-col items-center justify-center"
        >
            {/* Label */}
            <div className="absolute left-[var(--partner-badge-inset)] top-[var(--partner-badge-inset)] z-20 flex leading-none">
                <span className="inline-flex h-[var(--partner-badge-height)] items-center partner-social-badge rounded-full font-bold uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280]">
                    <span className="partner-badge-text">Social Partner</span>
                </span>
            </div>

            {/* Logo / Name */}
            <div className={LOGO_CONTAINER_CLASS}>
                {displayLogo ? (
                    <OptimizedImage
                        src={displayLogo}
                        alt={`${name} Logo`}
                        fallback={<PartnerLogoFallback name={name} style={{ color: '#0b2c52' }} />}
                        className={LOGO_IMAGE_CLASS}
                        loading="eager"
                    />
                ) : (
                    <PartnerLogoFallback name={name} style={{ color: '#0b2c52' }} />
                )}
            </div>
        </div>
    );
}

// ─── Unified PartnerCard ───
// variant: 'sponsor' | 'supporter' | 'social'
// tier (sponsor only): 'gold' | 'silver' | 'bronze'
export default function PartnerCard({ variant = 'sponsor', tier, name, logo, logoDark, wordmark, logoFallback, description, website, logoFit, showMetallicBackground = false, useCenteredHighlight = false }) {
    const wrap = (card) => (
        <PartnerCardLink website={website} name={name}>
            {card}
        </PartnerCardLink>
    );

    if (variant === 'supporter') {
        return wrap(<SupporterCard name={name} logo={logo} logoDark={logoDark} wordmark={wordmark} />);
    }

    if (variant === 'social') {
        return wrap(<SocialPartnerCard name={name} logo={logo} logoDark={logoDark} logoFallback={logoFallback} description={description} />);
    }

    // Default: sponsor (fancy)
    return wrap(
        <SponsorCard
            tier={tier}
            name={name}
            logo={logo}
            logoDark={logoDark}
            logoFit={logoFit}
            showMetallicBackground={showMetallicBackground}
            useCenteredHighlight={useCenteredHighlight}
        />
    );
}

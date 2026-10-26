import React, { useEffect, useRef, useState } from 'react';
import PartnerCard from '../cards/PartnerCard';
import './SponsorsSection.css';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

export default function SponsorsSection({ hideCTA = false }) {
    const { t } = useLocale();
    const normalizeTier = (tier) => (tier || '').toLowerCase().trim();
    const sponsorCardRefs = useRef([]);
    const [sponsorCols, setSponsorCols] = useState(null);
    const [centeredSponsorIndex, setCenteredSponsorIndex] = useState(null);

    // Current strategic partner data
    const partners = [
        // Partner
        {
            name: 'STARTPLATZ',
            tier: 'partner',
            logo: assetUrl('/cms/strategic-partner-logos/partner/Startplatz-logo.png'),
            logoDark: assetUrl('/cms/strategic-partner-logos/partner/Startplatz-logo.png'),
            website: 'https://www.startplatz.de',
        },

        // Supporter
        {
            name: 'DataCamp',
            tier: 'supporter',
            logo: assetUrl('/cms/strategic-partner-logos/supporter/DataCamp-Donates-logo-dark.png'),
            logoDark: assetUrl('/cms/strategic-partner-logos/supporter/DataCamp-Donates-logo-white.png'),
            website: 'https://www.datacamp.com/',
        },

        // Gold Tier
        // { name: 'Gold Partner Name', tier: 'gold', logo: '/cms/strategic-partner-logos/gold/logo.svg' },

        // Supporter Tier
        // {
        //     name: 'Knowunity',
        //     tier: 'silver',
        //     logo: assetUrl('/cms/strategic-partner-logos/silver/Knowunity-logo-black.svg'),
        //     logoDark: assetUrl('/cms/strategic-partner-logos/silver/Knowunity-logo-white.svg')
        // },

        // Supporter Tier
        // {
        //     name: 'OpenAI',
        //     tier: 'supporter',
        //     logo: assetUrl('/cms/strategic-partner-logos/supporter/openai-logo.svg'),
        //     logoDark: assetUrl('/cms/strategic-partner-logos/supporter/openai-logo.svg')
        // },
        // {
        //     name: 'AWS',
        //     tier: 'supporter',
        //     logo: assetUrl('/cms/strategic-partner-logos/supporter/aws-coloured.svg'),
        //     logoDark: assetUrl('/cms/strategic-partner-logos/supporter/aws-coloured-white.svg')
        // },
        // {
        //     name: 'AI Strategy Institute',
        //     tier: 'supporter',
        //     logo: assetUrl('/cms/strategic-partner-logos/supporter/AI_Logo_Standard_RGB_black.webp'),
        //     logoDark: assetUrl('/cms/strategic-partner-logos/supporter/AI_Logo_Standard_RGB_black.webp')
        // },
        // {
        //     name: 'Tech To The Rescue',
        //     tier: 'supporter',
        //     logo: '/cms/strategic-partner-logos/supporter/tech_to_the_rescue-Logo.png',
        //     logoDark: '/cms/strategic-partner-logos/supporter/tech_to_the_rescue-Logo.png'
        // },

        // Bronze Tier
        // { name: 'Bronze Partner Name', tier: 'bronze', logo: '/cms/strategic-partner-logos/bronze/logo.svg' },
    ];

    const sponsorPartners = partners.filter((p) => normalizeTier(p.tier) !== 'supporter');
    const supporterPartners = partners.filter((p) => normalizeTier(p.tier) === 'supporter');

    // CSS owns the responsive layout; this query only enables the mobile highlight.
    useEffect(() => {
        const singleColumn = window.matchMedia('(max-width: 639px)');
        const updateHighlight = () => setSponsorCols(singleColumn.matches ? 1 : null);
        updateHighlight();
        singleColumn.addEventListener('change', updateHighlight);
        return () => singleColumn.removeEventListener('change', updateHighlight);
    }, []);

    useEffect(() => {
        if (sponsorCols !== 1) {
            setCenteredSponsorIndex(null);
            return undefined;
        }

        let animationFrame = null;

        const updateCenteredSponsor = () => {
            animationFrame = null;
            const viewportCenter = window.innerHeight / 2;
            let activeIndex = null;
            let latestTopAtOrAboveViewportCenter = Number.NEGATIVE_INFINITY;
            let firstVisibleIndex = null;
            let firstVisibleTop = Number.POSITIVE_INFINITY;

            sponsorCardRefs.current.forEach((card, index) => {
                if (!card) return;

                const rect = card.getBoundingClientRect();
                const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
                if (!isVisible) return;

                if (rect.top < firstVisibleTop) {
                    firstVisibleTop = rect.top;
                    firstVisibleIndex = index;
                }

                if (
                    rect.top <= viewportCenter
                    && rect.top > latestTopAtOrAboveViewportCenter
                ) {
                    latestTopAtOrAboveViewportCenter = rect.top;
                    activeIndex = index;
                }
            });

            if (activeIndex === null) {
                activeIndex = firstVisibleIndex;
            }

            setCenteredSponsorIndex((currentIndex) => (
                currentIndex === activeIndex ? currentIndex : activeIndex
            ));
        };

        const scheduleUpdate = () => {
            if (animationFrame === null) {
                animationFrame = window.requestAnimationFrame(updateCenteredSponsor);
            }
        };

        scheduleUpdate();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            if (animationFrame !== null) {
                window.cancelAnimationFrame(animationFrame);
            }
        };
    }, [sponsorCols]);

    return (
        <>
            {sponsorPartners.length > 0 && (
                <div className="partner-card-grid partner-card-grid--sponsors">
                    {sponsorPartners.map((partner, index) => (
                        <div key={partner.name} ref={(element) => { sponsorCardRefs.current[index] = element; }} className="partner-card-grid__item">
                            <PartnerCard
                                variant="sponsor"
                                tier={partner.tier}
                                name={partner.name}
                                logo={partner.logo}
                                logoDark={partner.logoDark}
                                wordmark={partner.wordmark}
                                website={partner.website}
                                showMetallicBackground={sponsorCols === 1 && centeredSponsorIndex !== null && index === centeredSponsorIndex}
                                useCenteredHighlight={sponsorCols === 1}
                            />
                        </div>
                    ))}
                </div>
            )}
            {supporterPartners.length > 0 && (
                <div className="partner-card-grid partner-card-grid--supporters" style={{ '--supporter-count': supporterPartners.length }}>
                    {supporterPartners.map((partner) => (
                        <div key={partner.name} className="partner-card-grid__item">
                            <PartnerCard
                                variant="supporter"
                                name={partner.name}
                                logo={partner.logo}
                                logoDark={partner.logoDark}
                                wordmark={partner.wordmark}
                                website={partner.website}
                            />
                        </div>
                    ))}
                </div>
            )}
            {!hideCTA && (
                <div className="section-followup">
                    <p className="text-secondary">
                        {t.sponsorsSection.ctaText}
                    </p>
                    <Button variant="primary" href="/sponsors">
                        {t.sponsorsSection.ctaButton}
                    </Button>
                </div>
            )}
        </>
    );
}

import React, { useEffect, useRef, useState } from 'react';
import PartnerCard from '../cards/PartnerCard';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';

export default function SponsorsSection({ hideCTA = false }) {
    const { t } = useLocale();
    const normalizeTier = (tier) => (tier || '').toLowerCase().trim();
    const sponsorContainerRef = useRef(null);
    const supporterContainerRef = useRef(null);
    const [sponsorCols, setSponsorCols] = useState(1);
    const [supporterCols, setSupporterCols] = useState(1);

    // Current strategic partner data
    const partners = [
        // Gold Tier
        // { name: 'Gold Partner Name', tier: 'gold', logo: '/cms/strategic-partner-logos/gold/logo.svg' },

        // Supporter Tier
        {
            name: 'Knowunity',
            tier: 'silver',
            logo: '/cms/strategic-partner-logos/silver/Knowunity-logo-black.svg',
            logoDark: '/cms/strategic-partner-logos/silver/Knowunity-logo-white.svg'
        },

        // Supporter Tier
        {
            name: 'OpenAI',
            tier: 'supporter',
            logo: '/cms/strategic-partner-logos/supporter/openai-logo.svg',
            logoDark: '/cms/strategic-partner-logos/supporter/openai-logo.svg'
        },
        {
            name: 'AWS',
            tier: 'supporter',
            logo: '/cms/strategic-partner-logos/supporter/aws-coloured.svg',
            logoDark: '/cms/strategic-partner-logos/supporter/aws-coloured-white.svg'
        },
        {
            name: 'AI Strategy Institute',
            tier: 'supporter',
            logo: '/cms/strategic-partner-logos/supporter/AI_Logo_Standard_RGB_black.webp',
            logoDark: '/cms/strategic-partner-logos/supporter/AI_Logo_Standard_RGB_black.webp'
        },
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

    useEffect(() => {
        const updateCols = () => {
            if (sponsorContainerRef.current) {
                const width = sponsorContainerRef.current.offsetWidth;
                setSponsorCols(Math.max(1, Math.floor((width + 32) / (384 + 32))));
            }

            if (supporterContainerRef.current) {
                const width = supporterContainerRef.current.offsetWidth;
                setSupporterCols(Math.max(1, Math.floor((width + 32) / (260 + 32))));
            }
        };

        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);

    const splitForOrphan = (items, cols) => {
        if (cols <= 2 || items.length <= 1 || items.length % cols !== 1) {
            return [items, []];
        }
        return [items.slice(0, -2), items.slice(-2)];
    };

    const [sponsorPrimary, sponsorTail] = splitForOrphan(sponsorPartners, sponsorCols);
    const [supporterPrimary, supporterTail] = splitForOrphan(supporterPartners, supporterCols);

    return (
        <>
            {sponsorPartners.length > 0 && (
                <div ref={sponsorContainerRef} className="px-4">
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {sponsorPrimary.map((partner, index) => (
                            <div key={`sponsor-primary-${index}`} className="w-full max-w-sm">
                                <PartnerCard
                                    variant="sponsor"
                                    tier={partner.tier}
                                    name={partner.name}
                                    logo={partner.logo}
                                    logoDark={partner.logoDark}
                                />
                            </div>
                        ))}
                    </div>
                    {sponsorTail.length > 0 && (
                        <div className="mt-8 flex flex-wrap justify-center items-center gap-8">
                            {sponsorTail.map((partner, index) => (
                                <div key={`sponsor-tail-${index}`} className="w-full max-w-sm">
                                    <PartnerCard
                                        variant="sponsor"
                                        tier={partner.tier}
                                        name={partner.name}
                                        logo={partner.logo}
                                        logoDark={partner.logoDark}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {supporterPartners.length > 0 && (
                <div ref={supporterContainerRef} className="px-4 mt-8">
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {supporterPrimary.map((partner, index) => (
                            <div key={`supporter-primary-${index}`} className="w-full max-w-[260px]">
                                <PartnerCard
                                    variant="supporter"
                                    name={partner.name}
                                    logo={partner.logo}
                                    logoDark={partner.logoDark}
                                />
                            </div>
                        ))}
                    </div>
                    {supporterTail.length > 0 && (
                        <div className="mt-8 flex flex-wrap justify-center items-center gap-8">
                            {supporterTail.map((partner, index) => (
                                <div key={`supporter-tail-${index}`} className="w-full max-w-[260px]">
                                    <PartnerCard
                                        variant="supporter"
                                        name={partner.name}
                                        logo={partner.logo}
                                        logoDark={partner.logoDark}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {!hideCTA && (
                <div className="mt-16 text-center">
                    <p className="text-secondary mb-8">
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

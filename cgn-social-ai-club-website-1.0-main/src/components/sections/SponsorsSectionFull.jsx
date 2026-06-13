import React from 'react';
import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import SponsorsSection from './SponsorsSection';
import { useLocale } from '../../i18n/LocaleContext';

const SponsorsSectionFull = () => {
    const { t } = useLocale();

    return (
        <section id="sponsors" className="w-full py-16">
            <Container>
                <div className="flex flex-col items-center mb-12 md:mb-16 space-y-4 text-center px-2">
                    <SectionLabel>{t.home.sponsorsBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-primary)] font-heading">
                        {t.home.sponsorsTitle}
                    </h2>
                </div>
                <SponsorsSection />
            </Container>
        </section>
    );
};

export default SponsorsSectionFull;

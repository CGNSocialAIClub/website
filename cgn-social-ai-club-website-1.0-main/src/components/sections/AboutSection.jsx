import React from 'react';
import Container from '../ui/Container';
import HeadingSection from '../ui/HeadingSection';
import { useLocale } from '../../i18n/LocaleContext';

const AboutSection = () => {
    const { t } = useLocale();

    return (
        <section id="about" className="w-full">
            <Container className="mb-24">
                <HeadingSection
                    as="h2"
                    badge={t.home.aboutBadge}
                    title={t.home.aboutTitle}
                    className="mt-0 mb-0"
                    hideBadge={false}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-surface)] shadow-lg rounded-[1.5rem] p-8 md:p-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6 font-heading">{t.home.missionTitle}</h3>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            {t.home.missionText}
                        </p>
                    </div>
                    <div className="bg-[var(--bg-surface)] shadow-lg rounded-[1.5rem] p-8 md:p-10">
                        <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6 font-heading">{t.home.visionTitle}</h3>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                            {t.home.visionText}
                        </p>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default AboutSection;

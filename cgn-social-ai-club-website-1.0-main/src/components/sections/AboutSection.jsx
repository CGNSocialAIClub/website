import IconHeadingGroup from '../ui/IconHeadingGroup';
import React from 'react';
import { Target, Eye } from 'lucide-react';
import Container from '../ui/Container';
import HeadingSection from '../ui/HeadingSection';
import { useLocale } from '../../i18n/LocaleContext';

const AboutSection = () => {
    const { t } = useLocale();

    return (
        <section id="about" className="w-full">
            <Container className="section-block">
                <HeadingSection
                    as="h2"
                    badge={t.home.aboutBadge}
                    title={t.home.aboutTitle}
                    className="mt-0 mb-0"
                    hideBadge={false}
                />
                <div className="mt-10" />
                <IconHeadingGroup maxFontSize={36} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-surface)] shadow-lg rounded-[1.5rem] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--blue flex items-center justify-center">
                                <Target className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h3 className="icon-aligned-heading text-4xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.home.missionTitle}</h3>
                        </div>
                        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                            {t.home.missionText}
                        </p>
                    </div>
                    <div className="bg-[var(--bg-surface)] shadow-lg rounded-[1.5rem] p-8 md:p-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--green flex items-center justify-center">
                                <Eye className="w-6 h-6" aria-hidden="true" />
                            </div>
                            <h3 className="icon-aligned-heading text-4xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.home.visionTitle}</h3>
                        </div>
                        <p className="text-base text-[var(--text-secondary)] leading-relaxed">
                            {t.home.visionText}
                        </p>
                    </div>
                </IconHeadingGroup>
            </Container>
        </section>
    );
};

export default AboutSection;

import React from 'react';
import Container from '../ui/Container';
import { useLocale } from '../../i18n/LocaleContext';

const TeamPhotoSection = () => {
    const { t } = useLocale();

    return (
        <section id="team-photo" className="w-full">
            <Container className="mb-10">
                <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden rounded-[1.5rem]">
                    <img
                        src="/cms/team/team-kickoff.jpg"
                        alt={t.home.teamPhotoAlt}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hidden">
                        <p className="text-lg font-medium italic">{t.home.teamPhotoFallback}</p>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default TeamPhotoSection;

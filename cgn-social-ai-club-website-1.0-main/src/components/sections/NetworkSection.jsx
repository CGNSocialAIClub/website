import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';
import { useState, useEffect } from 'react';

function ChapterCard({ name, city, description, href, logoLight, logoDark, visitText }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark'));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <div className="flex flex-col justify-between p-6 md:p-8 rounded-3xl bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all duration-300 border border-[var(--border-subtle)] w-full max-w-[480px] mx-auto">
            <div>
                <img
                    src={assetUrl(isDark ? logoDark : logoLight)}
                    alt={`${name} Logo`}
                    className="h-10 w-auto mb-6 object-contain object-left"
                    loading="lazy"
                />
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-accent)] mb-2">{city}</p>
                <h3 className="text-[22px] font-bold text-[var(--text-primary)] mb-3 font-heading">{name}</h3>
                <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-6">{description}</p>
            </div>
            <div>
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button variant="glass" className="font-bold">{visitText}</Button>
                </a>
            </div>
        </div>
    );
}

export default function NetworkSection() {
    const { t } = useLocale();

    return (
        <section id="network" className="w-full py-16">
            <Container className="flex flex-col items-center">
                <div className="text-center mb-12 md:mb-16 space-y-4 px-2">
                    <SectionLabel>{t.home.networkBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-heading">
                        {t.home.networkTitle}
                    </h2>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        {t.home.networkDescription}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 w-full max-w-xl">
                    <ChapterCard
                        name="TUM Social AI Club"
                        city="Munich"
                        description={t.home.networkTumDescription}
                        href="https://tum-socialaiclub.de"
                        logoLight="/assets/logos/LOGO-V6-ICON+TUM-SOCIAL-CLUB-dark-text.svg"
                        logoDark="/assets/logos/LOGO-V6-ICON+TUM-SOCIAL-CLUB-white-text.svg"
                        visitText={t.home.networkVisit}
                    />
                </div>
            </Container>
        </section>
    );
}

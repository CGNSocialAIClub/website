import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';
import { RECRUITING, areApplicationsOpen } from '../../config/features';

// Semester recruiting teaser. Artwork has an empty left half for the text;
// light/dark images are swapped via the .dark class (see index.css).
export default function RecruitingBanner() {
    const { t } = useLocale();
    if (!RECRUITING.bannerEnabled) return null;

    const copy = t.home.recruiting;
    const isOpen = areApplicationsOpen();

    return (
        <section className="w-full mt-20 mb-24" aria-labelledby="recruiting-title">
            <Container>
                <div className="relative overflow-hidden rounded-[24px] border border-[var(--border-default)] bg-[var(--recruiting-bg)] shadow-lg lg:aspect-[3/1]">
                    <div className="relative z-10 flex flex-col items-start px-6 pt-8 md:px-10 md:pt-10 lg:absolute lg:inset-y-0 lg:left-0 lg:w-[48%] lg:justify-center lg:px-12 lg:py-8 xl:px-16">
                        <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.14em] text-[var(--recruiting-kicker)] md:text-sm">
                            {copy.kicker}
                        </p>
                        <h2 id="recruiting-title" className="font-heading text-3xl font-bold leading-[1.05] text-[var(--text-primary)] md:text-4xl xl:text-5xl">
                            {copy.title}
                        </h2>
                        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-[var(--text-secondary)] xl:text-lg">
                            {isOpen ? copy.textOpen : copy.textBefore}
                        </p>
                        <Button variant="primary" href="/application" className="mt-6">
                            {isOpen ? copy.ctaOpen : copy.ctaBefore} →
                        </Button>
                    </div>

                    <div className="relative -mt-6 aspect-[3/2] w-full md:-mt-12 md:aspect-[12/5] lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto" aria-hidden="true">
                        <img
                            src={assetUrl('/assets/banners/recruiting-light.webp')}
                            alt=""
                            loading="lazy"
                            className="recruiting-art-light absolute inset-0 h-full w-full object-cover object-right-bottom"
                        />
                        <img
                            src={assetUrl('/assets/banners/recruiting-dark.webp')}
                            alt=""
                            loading="lazy"
                            className="recruiting-art-dark absolute inset-0 h-full w-full object-cover object-right-bottom"
                        />
                    </div>
                </div>
            </Container>
        </section>
    );
}

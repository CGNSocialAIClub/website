import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { useLocale } from '../../i18n/LocaleContext';
import RecruitingPill from '../ui/RecruitingPill';
import { RECRUITING, FEATURES } from '../../config/features';

const HeroSection = () => {
    const { t } = useLocale();

    return (
        <Container className="flex flex-col items-center">
            {/* The pill takes the place of part of the top margin, so the logo stays where it is */}
            <div className={`max-w-4xl w-full text-center space-y-8 mb-4 px-0 ${RECRUITING.bannerEnabled ? 'mt-1 md:mt-8' : 'mt-20 md:mt-32'}`}>
                <h1 className="sr-only">Germany's first AI for Good Student Initiative | CGN Social AI Club</h1>
                {RECRUITING.bannerEnabled && (
                    // gap to the logo matches the gap to the navbar above (overrides space-y-8)
                    <div className="intro-actions flex justify-center !mb-11 md:!mb-14">
                        <RecruitingPill />
                    </div>
                )}
                {FEATURES.introAnimation ? (
                    // Icon + wordmark lockup. The icon slot stays empty: the intro (FirstVisitIntro)
                    // flies the animated icon into it, and without the intro the lockup image shows it.
                    <div id="hero-logo" className="mx-auto w-full max-w-3xl">
                        <span data-hero-icon aria-hidden="true" />
                        <img src="/assets/logos/CGN-Social-AI-Club-single-line-dark-text.svg" alt="CGN Social AI Club" width="2191" height="182" className="hero-logo-light w-full h-auto" />
                        <img src="/assets/logos/CGN-Social-AI-Club-single-line-white-text.svg" alt="CGN Social AI Club" width="2191" height="182" className="hero-logo-dark w-full h-auto" />
                    </div>
                ) : (
                    <div id="hero-logo" className="flex justify-center w-full px-4 md:px-8">
                        <Logo heroDesktopSingleLine fullWidth className="w-full max-w-2xl mx-auto" />
                    </div>
                )}
                <p className="intro-copy text-l md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body whitespace-pre-line">
                    {t.home.heroDescription}
                </p>
                <div className="intro-actions flex flex-col sm:flex-row w-full flex-wrap items-center justify-center gap-4 pt-4 sm:gap-6">
                    <Button variant="primary" className="sm:w-auto" href="/application">{t.home.heroPrimary}</Button>
                    <Button variant="tertiary" className="sm:w-auto font-bold" href="/projects">{t.home.heroSecondary}</Button>
                </div>
            </div>
        </Container>
    );
};

export default HeroSection;

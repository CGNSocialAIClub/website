import React from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { useLocale } from '../../i18n/LocaleContext';

const HeroSection = () => {
    const { t } = useLocale();

    return (
        <Container className="flex flex-col items-center">
            <div className="max-w-4xl w-full text-center space-y-8 mt-20 md:mt-32 mb-4 px-0">
                <h1 className="sr-only">Germany's first AI for Good Student Initiative | CGN Social AI Club</h1>
                <div id="hero-logo" className="flex justify-center w-full px-4 md:px-8">
                    <Logo heroDesktopSingleLine fullWidth className="w-full max-w-2xl mx-auto" />
                </div>
                <p className="text-l md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body whitespace-pre-line">
                    {t.home.heroDescription}
                </p>
                <div className="flex flex-col sm:flex-row w-full flex-wrap items-center justify-center gap-4 pt-4 sm:gap-6">
                    <Button variant="primary" className="sm:w-auto" href="/application">{t.home.heroPrimary}</Button>
                    <Button variant="tertiary" className="sm:w-auto font-bold" href="/projects">{t.home.heroSecondary}</Button>
                </div>
            </div>
        </Container>
    );
};

export default HeroSection;

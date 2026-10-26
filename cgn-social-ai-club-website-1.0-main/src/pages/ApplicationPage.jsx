import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import MemberJourneyCard from '../components/cards/MemberJourneyCard';
import DepartmentCard from '../components/cards/DepartmentCard';

import Button from '../components/ui/Button';
import CTASection from '../components/sections/CTASection';
import { Rocket, Target, Brain, Lightbulb, Users, TrendingUp, GraduationCap, X } from 'lucide-react';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';
import { SITE_POPUP, areApplicationsOpen } from '../config/features';
import { assetUrl } from '../utils/assetUrl';

const APPLICATION_FORM_URL = 'https://tally.so/r/dWrOqD';

export default function ApplicationPage() {
    const { t } = useLocale();
    const [showSitePopup, setShowSitePopup] = useState(false);
    const stepRefs = useRef([]);
    const connectorRefs = useRef([]);
    const applicationsOpen = areApplicationsOpen();
    const statusTitle = applicationsOpen ? t.pages.application.statusTitle : t.pages.application.statusTitleBefore;
    const statusTitleWords = statusTitle.split(' ');
    const statusTitleWithPreferredBreak = statusTitleWords.length <= 1
        ? statusTitle
        : (
            <>
                {statusTitleWords[0]}
                {' '}
                <span className="sm:whitespace-nowrap">
                    {statusTitleWords.slice(1).join(' ')}
                </span>
            </>
        );

    useEffect(() => {
        if (!SITE_POPUP.enabled) return;
        if (localStorage.getItem(SITE_POPUP.storageKey) === 'true') return;

        const popupTimer = window.setTimeout(() => {
            setShowSitePopup(true);
        }, SITE_POPUP.delayMs);

        return () => window.clearTimeout(popupTimer);
    }, []);

    const dismissSitePopup = () => {
        localStorage.setItem(SITE_POPUP.storageKey, 'true');
        setShowSitePopup(false);
    };

    useEffect(() => {
        let frameId;

        const updateActiveJourneyElements = () => {
            const targetY = window.innerHeight / 2;

            let closestStepIndex = -1;
            let closestStepDistance = Number.POSITIVE_INFINITY;
            stepRefs.current.forEach((element, index) => {
                if (!element) return;
                const rect = element.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const distance = Math.abs(centerY - targetY);
                if (distance < closestStepDistance) {
                    closestStepDistance = distance;
                    closestStepIndex = index;
                }
            });

            stepRefs.current.forEach((element, index) => {
                if (!element) return;
                const isActive = index === closestStepIndex;
                const isNeighbor = Math.abs(index - closestStepIndex) === 1;
                element.classList.toggle('is-active', isActive);
                element.classList.toggle('is-near', isNeighbor);
            });

            let closestConnectorIndex = -1;
            let closestConnectorDistance = Number.POSITIVE_INFINITY;
            connectorRefs.current.forEach((element, index) => {
                if (!element) return;
                const rect = element.getBoundingClientRect();
                const centerY = rect.top + rect.height / 2;
                const distance = Math.abs(centerY - targetY);
                if (distance < closestConnectorDistance) {
                    closestConnectorDistance = distance;
                    closestConnectorIndex = index;
                }
            });
            connectorRefs.current.forEach((element, index) => {
                if (!element) return;
                const isActive = index === closestConnectorIndex;
                const isNeighbor = Math.abs(index - closestConnectorIndex) === 1;
                element.classList.toggle('is-active', isActive);
                element.classList.toggle('is-near', isNeighbor);
            });
        };

        const scheduleUpdate = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateActiveJourneyElements);
        };

        scheduleUpdate();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, []);

    return (
        <div className="flex flex-col items-center pt-0 pb-12">
            <Seo title={t.pages.application.title} description={t.pages.application.subtitle} />
            <Container>
                <HeadingSection
                    as="h1"
                    badge={t.pages.application.journeyBadge}
                    title={statusTitleWithPreferredBreak}
                    subtitle={applicationsOpen
                        ? t.pages.application.statusSubtitle
                        : t.pages.application.statusSubtitleBefore}
                />

                <div className="application-journey relative mx-auto max-w-4xl">
                    <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none" style={{ top: applicationsOpen ? '24px' : 0 }} aria-hidden="true">
                        <div className="timeline-line" />
                    </div>
                {applicationsOpen && (
                    <div id="start-application" className="relative mx-auto mb-8 flex max-w-4xl flex-col items-center scroll-mt-36">
                        <Button className="z-10 application-start-pulse" href={APPLICATION_FORM_URL} target="_blank" rel="noopener noreferrer">
                            {t.pages.application.startApplication}
                        </Button>
                    </div>
                )}

                {/* Timeline Layout - sequential border glow */}
                <div className="relative max-w-4xl mx-auto flex flex-col gap-8 md:gap-12">
                    {/* Step 1: Batch Introduction - Centered at top */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[0] = element; }} className="journey-step rounded-3xl w-full max-w-md z-10">
                            <MemberJourneyCard
                                icon={<Rocket className="w-7 h-7 text-[var(--text-primary)]" />}
                                title={t.pages.application.steps.introTitle}
                                description={t.pages.application.steps.introText}
                            />
                        </div>
                    </div>
                    {/* Step 2: Initiative Track & Engineering Track - Connected box */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[1] = element; }} className="journey-step w-full z-10 bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border-default)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 relative">
                                {/* Engineering Track - First on mobile (stacked on top), Left on desktop */}
                                <div className="p-6 md:p-8 flex flex-col gap-3 order-1 md:order-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] flex-shrink-0">
                                            <Brain className="w-7 h-7 text-purple-400" />
                                        </div>
                                        <span className="text-[length:var(--type-heading-sm)] leading-heading font-semibold text-[var(--text-primary)] font-heading">
                                            {t.pages.application.steps.engineeringTitle}
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                                        {t.pages.application.steps.engineeringText}
                                    </p>
                                </div>

                                {/* Decorative OR separator */}
                                {/* Mobile: horizontal */}
                                <div className="flex md:hidden items-center justify-center px-8 order-2">
                                    <div className="flex-1 h-px bg-[var(--border-default)]" />
                                    <span className="px-4 text-sm font-semibold text-[var(--text-tertiary)] uppercase">{t.pages.application.steps.or}</span>
                                    <div className="flex-1 h-px bg-[var(--border-default)]" />
                                </div>
                                {/* Desktop: vertical */}
                                <div className="hidden md:flex absolute left-1/2 top-8 bottom-8 -translate-x-1/2 flex-col items-center">
                                    <div className="flex-1 w-px bg-[var(--border-default)]" />
                                    <span className="py-3 text-sm font-semibold text-[var(--text-tertiary)] uppercase">{t.pages.application.steps.or}</span>
                                    <div className="flex-1 w-px bg-[var(--border-default)]" />
                                </div>

                                {/* Initiative Track - Second on mobile, Right on desktop */}
                                <div className="p-6 md:p-8 flex flex-col gap-3 order-3 md:order-2">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] flex-shrink-0">
                                            <Target className="w-7 h-7 text-[#FF7D00]" />
                                        </div>
                                        <span className="text-[length:var(--type-heading-sm)] leading-heading font-semibold text-[var(--text-primary)] font-heading">
                                            {t.pages.application.steps.initiativeTitle}
                                        </span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                                        {t.pages.application.steps.initiativeText}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Step 3: Expert Mentorship */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[2] = element; }} className="journey-step rounded-3xl z-10 max-w-md w-full">
                            <MemberJourneyCard
                                icon={<Users className="w-7 h-7 text-[#3EB19C]" />}
                                title={t.pages.application.steps.mentorshipTitle}
                                description={t.pages.application.steps.mentorshipText}
                            />
                        </div>
                    </div>
                    {/* Step 4: Community Events */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[3] = element; }} className="journey-step rounded-3xl z-10 max-w-md w-full">
                            <MemberJourneyCard
                                icon={<Lightbulb className="w-7 h-7 text-blue-400" />}
                                title={t.pages.application.steps.eventsTitle}
                                description={t.pages.application.steps.eventsText}
                            />
                        </div>
                    </div>
                    {/* Step 5: Leadership & Ownership */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[4] = element; }} className="journey-step rounded-3xl w-full max-w-md z-10">
                            <MemberJourneyCard
                                icon={<TrendingUp className="w-7 h-7 text-violet-400" />}
                                title={t.pages.application.steps.leadershipTitle}
                                description={t.pages.application.steps.leadershipText}
                            />
                        </div>
                    </div>
                    {/* Step 6: Alumni Network - Centered at bottom */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[5] = element; }} className="journey-step rounded-3xl w-full max-w-md z-10">
                            <MemberJourneyCard
                                icon={<GraduationCap className="w-7 h-7 text-amber-400" />}
                                title={t.pages.application.steps.alumniTitle}
                                description={t.pages.application.steps.alumniText}
                            />
                        </div>
                    </div>
                </div>

                </div>

                <div className="section-start">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.community.departmentsBadge}
                        title={t.pages.community.departmentsTitle}
                        subtitle={t.pages.community.departmentsSubtitle}
                        className="mb-10"
                    />
                </div>

                <div className="mb-8 md:mb-12">
                    <div className="flex flex-col gap-4 md:gap-6">
                        {(() => {
                            const departments = [
                                { name: 'Engineering', logo: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-ENGINEERING.png'), logoDark: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-ENGINEERING-light.png') },
                                { name: 'Social Partnerships', logo: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-SOCIAL-PARTNERSHIPS.png'), logoDark: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-SOCIAL-PARTNERSHIPS-light.png') },
                                { name: 'Strategic Partnerships', logo: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-STRATEGIC-PARTNERSHIPS.png'), logoDark: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-STRATEGIC-PARTNERSHIPS-light.png') },
                                { name: 'Community', logo: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-COMMUNITY.png'), logoDark: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-COMMUNITY-light.png') },
                                { name: 'Marketing', logo: assetUrl('/assets/logos/V6-ICON+DEPARTMENT-MARKETING.png'), logoDark: assetUrl('/assets/logos/V6-ICON+DEPARTMENT-MARKETING-light.png') },
                                { name: 'Finance Legal Admin', logo: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-FINANCE-LEGAL.png'), logoDark: assetUrl('/assets/logos/V6_ICON+DEPARTMENT-FINANCE-LEGAL-light.png') },
                            ];

                            return (
                                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                        {departments.map((dept) => (
                                            <div key={dept.name} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-[420px]">
                                                <DepartmentCard
                                                    name={dept.name}
                                                    logo={dept.logo}
                                                    logoDark={dept.logoDark}
                                                />
                                            </div>
                                        ))}
                                    </div>
                            );
                        })()}
                    </div>
                </div>

            </Container>

            <CTASection
                variant={undefined}
                heading={t.pages.application.ctaHeading}
                text={t.pages.application.ctaText}
                buttons={[
                    ...(applicationsOpen ? [{ label: t.pages.application.startApplication, href: APPLICATION_FORM_URL, variant: 'gradient', target: '_blank' }] : []),
                    { label: t.pages.application.ctaSecondary, href: '/contact', variant: applicationsOpen ? 'tertiary' : 'gradient' }
                ]}
            />

            {showSitePopup && SITE_POPUP.enabled && typeof document !== 'undefined' && createPortal(
                <aside
                    className="qa-session-popup fixed bottom-4 right-4 z-[9999] max-h-[calc(100svh-2rem)] w-[320px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left shadow-xl md:bottom-6 md:right-6 lg:right-10"
                    aria-label={SITE_POPUP.ariaLabel}
                >
                    <button
                        type="button"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--active-overlay)] hover:text-[var(--text-primary)]"
                        aria-label={SITE_POPUP.dismissAriaLabel}
                        onClick={dismissSitePopup}
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div className="pr-8">
                        <div className="flex items-center gap-2">
                            <OptimizedImage
                                src={SITE_POPUP.badgeLogoSrc}
                                alt={SITE_POPUP.badgeLogoAlt}
                                fallback={<span className="font-heading font-bold">{SITE_POPUP.badgeLogoAlt}</span>}
                                className="h-5 w-auto shrink-0"
                            />
                            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                                {SITE_POPUP.badgeLabel}
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                            {SITE_POPUP.body}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                            {SITE_POPUP.meta}
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        href={SITE_POPUP.ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full py-3 text-sm font-bold"
                    >
                        {SITE_POPUP.ctaLabel}
                    </Button>
                </aside>,
                document.body
            )}

        </div>
    );
}

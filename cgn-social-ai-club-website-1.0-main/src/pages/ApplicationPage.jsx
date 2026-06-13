import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import MemberJourneyCard from '../components/cards/MemberJourneyCard';
import DepartmentCard from '../components/cards/DepartmentCard';

import Button from '../components/ui/Button';
import CTASection from '../components/sections/CTASection';
import SocialsSection from '../components/sections/SocialsSection';
import { Rocket, Target, Brain, Lightbulb, Users, GraduationCap, X } from 'lucide-react';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';
import { APPLICATIONS_OPEN } from '../config/applicationStatus';
import { SITE_POPUP } from '../config/features';
import SectionLabel from '../components/ui/SectionLabel';

export default function ApplicationPage() {
    const { t } = useLocale();
    // Hidden toggle for application status
    const applicationsOpen = APPLICATIONS_OPEN;
    const [showSitePopup, setShowSitePopup] = useState(false);
    const stepRefs = useRef([]);
    const connectorRefs = useRef([]);
    const statusTitle = applicationsOpen
        ? t.pages.application.statusTitleOpen
        : t.pages.application.statusTitleClosed;
    const statusTitleWords = statusTitle.split(' ');
    const statusTitleWithPreferredBreak = statusTitleWords.length <= 1
        ? statusTitle
        : (
            <>
                {statusTitleWords[0]}
                {' '}
                <wbr />
                {statusTitleWords.slice(1).join('\u00A0')}
            </>
        );

    useEffect(() => {
        if (!applicationsOpen || !SITE_POPUP.enabled) return;
        if (localStorage.getItem(SITE_POPUP.storageKey) === 'true') return;

        const popupTimer = window.setTimeout(() => {
            setShowSitePopup(true);
        }, SITE_POPUP.delayMs);

        return () => window.clearTimeout(popupTimer);
    }, [applicationsOpen]);

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
            <Seo title={t.pages.application.title} description={applicationsOpen ? t.pages.application.subtitleOpen : t.pages.application.statusSubtitleClosed} />
            <Container>
                <HeadingSection
                    as="h2"
                    badge={t.pages.application.journeyBadge}
                    title={t.pages.application.journeyTitle}
                    subtitle={applicationsOpen
                        ? t.pages.application.subtitleOpen
                        : t.pages.application.subtitleClosed}
                    className=""
                />

                {applicationsOpen && <div className="journey-connector mx-auto -my-5 md:-my-7" />}

                {/* Timeline Layout - sequential border glow */}
                <div className="relative max-w-4xl mx-auto flex flex-col gap-0">
                    <div className="journey-backbone" />
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
                    <div ref={(element) => { connectorRefs.current[0] = element; }} className="journey-connector mx-auto -my-5 md:-my-7" />

                    {/* Step 2: Initiative Track & Engineering Track - Connected box */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[1] = element; }} className="journey-step w-full z-10 bg-[var(--bg-surface)] rounded-2xl shadow-lg border border-[var(--border-default)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 relative">
                                {/* Engineering Track - First on mobile (stacked on top), Left on desktop */}
                                <div className="p-6 md:p-8 flex flex-col gap-3 order-1 md:order-1">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] flex-shrink-0">
                                            <Brain className="w-7 h-7 text-purple-400" />
                                        </div>
                                        <span className="text-lg font-semibold text-[var(--text-primary)] font-heading pt-1.5">
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
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] flex-shrink-0">
                                            <Target className="w-7 h-7 text-[#FF7D00]" />
                                        </div>
                                        <span className="text-lg font-semibold text-[var(--text-primary)] font-heading pt-1.5">
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
                    <div ref={(element) => { connectorRefs.current[1] = element; }} className="journey-connector mx-auto -my-5 md:-my-7" />

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
                    <div ref={(element) => { connectorRefs.current[2] = element; }} className="journey-connector mx-auto -my-5 md:-my-7" />

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
                    <div ref={(element) => { connectorRefs.current[3] = element; }} className="journey-connector mx-auto -my-5 md:-my-7" />

                    {/* Step 5: Alumni Network - Centered at bottom */}
                    <div className="relative flex justify-center">
                        <div ref={(element) => { stepRefs.current[4] = element; }} className="journey-step rounded-3xl w-full max-w-md z-10">
                            <MemberJourneyCard
                                icon={<GraduationCap className="w-7 h-7 text-amber-400" />}
                                title={t.pages.application.steps.alumniTitle}
                                description={t.pages.application.steps.alumniText}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-16 md:mt-20">
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
                                { name: 'Engineering', logo: '/assets/logos/V6_ICON+DEPARTMENT-ENGINEERING.png', logoDark: '/assets/logos/V6_ICON+DEPARTMENT-ENGINEERING-light.png' },
                                { name: 'Social Partnerships', logo: '/assets/logos/V6_ICON+DEPARTMENT-SOCIAL-PARTNERSHIPS.png', logoDark: '/assets/logos/V6_ICON+DEPARTMENT-SOCIAL-PARTNERSHIPS-light.png' },
                                { name: 'Strategic Partnerships', logo: '/assets/logos/V6_ICON+DEPARTMENT-STRATEGIC-PARTNERSHIPS.png', logoDark: '/assets/logos/V6_ICON+DEPARTMENT-STRATEGIC-PARTNERSHIPS-light.png' },
                                { name: 'Community', logo: '/assets/logos/V6_ICON+DEPARTMENT-COMMUNITY.png', logoDark: '/assets/logos/V6_ICON+DEPARTMENT-COMMUNITY-light.png' },
                                { name: 'Marketing', logo: '/assets/logos/V6-ICON+DEPARTMENT-MARKETING.png', logoDark: '/assets/logos/V6-ICON+DEPARTMENT-MARKETING-light.png' },
                                { name: 'Finance Legal Admin', logo: '/assets/logos/V6_ICON+DEPARTMENT-FINANCE-LEGAL.png', logoDark: '/assets/logos/V6_ICON+DEPARTMENT-FINANCE-LEGAL-light.png' },
                            ];

                            const engineering = departments.find((dept) => dept.name === 'Engineering');
                            const others = departments.filter((dept) => dept.name !== 'Engineering');

                            return (
                                <>
                                    {engineering && (
                                        <div>
                                            <DepartmentCard
                                                key={engineering.name}
                                                name={engineering.name}
                                                logo={engineering.logo}
                                                logoDark={engineering.logoDark}
                                                isMain
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                                        {others.map((dept) => (
                                            <div key={dept.name} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-[420px]">
                                                <DepartmentCard
                                                    name={dept.name}
                                                    logo={dept.logo}
                                                    logoDark={dept.logoDark}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div className="mx-auto mt-16 mb-12 flex w-full max-w-4xl flex-col items-center text-center md:mt-20">
                    <div className="mb-6">
                        <SectionLabel>{t.pages.application.badge}</SectionLabel>
                    </div>
                    <h1 className="max-w-4xl text-5xl font-bold font-heading text-[var(--text-primary)] md:text-6xl">
                        {statusTitleWithPreferredBreak}
                    </h1>
                    <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[var(--text-secondary)] md:text-2xl">
                        {applicationsOpen
                            ? t.pages.application.statusSubtitleOpen
                            : t.pages.application.statusSubtitleClosed}
                    </p>
                    {applicationsOpen && (
                        <div id="start-application" className="mt-8 flex w-full flex-col items-center gap-8 scroll-mt-36">
                            <Button className="z-10 apply-now-pulse" href="https://application.cgn-socialaiclub.de" target="_blank" rel="noopener noreferrer">
                                {t.pages.application.startApplication}
                            </Button>
                        </div>
                    )}
                </div>
            </Container>

            {applicationsOpen ? (
                <CTASection
                    variant={undefined}
                    heading={t.pages.application.ctaHeading}
                    text={t.pages.application.ctaText}
                    buttons={[
                        { label: t.pages.application.startApplication, href: 'https://application.cgn-socialaiclub.de', variant: 'primary', target: '_blank' },
                        { label: t.pages.application.ctaSecondary, href: '/team', variant: 'tertiary' }
                    ]}
                />
            ) : (
                <SocialsSection />
            )}

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
                            <img
                                src={SITE_POPUP.badgeLogoSrc}
                                alt={SITE_POPUP.badgeLogoAlt}
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

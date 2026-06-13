import React from 'react';
import { HandCoins, HandFist, UsersRound } from 'lucide-react';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import Button from '../components/ui/Button';
import CTASection from '../components/sections/CTASection';
import PartnerCard from '../components/cards/PartnerCard';
import ProjectCard from '../components/cards/ProjectCard';
import SectionLabel from '../components/ui/SectionLabel';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';
import { getProjects } from '../utils/cms';

const socialPartners = [
    {
        name: 'Initiative Gruppe',
        logo: '/cms/all-partner-logos/initiative-gruppe-coloured.svg',
        logoFallback: '/cms/all-partner-logos/initiative-gruppe-logo.png',
        description: 'Supporting integration and education for migrants and refugees in Cologne through innovative AI-powered tools.',
    },
    {
        name: 'Entreculturas',
        logo: '/cms/all-partner-logos/entreculturas-coloured.svg',
        description: 'Leveraging AI to advance educational access and intercultural dialogue across communities worldwide.',
    },
    {
        name: 'Kulturator',
        logo: '/cms/all-partner-logos/kulturator-coloured.svg',
        description: 'Applying data-driven solutions to promote cultural engagement and preserve heritage.',
    },
    {
        name: 'UN Women',
        logo: '/cms/all-partner-logos/Un-women-for-all-women-and-girls-coloured.png',
        description: 'Building AI tools that empower gender equality initiatives and support women and girls globally.',
    },
];

const howWeWork = [
    {
        step: '01',
        title: 'Understand the Challenge',
        text: 'We start by listening to you. Together we map your challenge — from data gaps to operational bottlenecks — and define what success looks like.',
    },
    {
        step: '02',
        title: 'Assemble the Team',
        text: 'We assign a dedicated student team of AI engineers, designers, and project managers matched to your needs and context.',
    },
    {
        step: '03',
        title: 'Build & Iterate',
        text: 'Over the semester, we move from prototype to working MVP and finally a deployable solution, iterating with your feedback at every stage.',
    },
    {
        step: '04',
        title: 'Deliver & Handover',
        text: 'We deliver a production-ready solution with documentation and training so your organization can sustain and scale the impact.',
    },
];

export default function SocialPartnersPage() {
    const { t, locale } = useLocale();
    const localizedHowWeWork = t.socialPartners.howWeWork.map(([step, title, text]) => ({ step, title, text }));
    const localizedPartners = socialPartners.map((partner) => ({
        ...partner,
        description: t.socialPartners.partners[partner.name] || partner.description,
    }));
    const featuredProjects = getProjects(locale).filter((project) => ['4', '2', '5'].includes(project.id));

    return (
        <div className="flex flex-col items-center pt-0 pb-12">
            <Seo title={t.pages.socialPartners.title} description={t.pages.socialPartners.subtitle} />
            {/* Hero */}
            <Container>
                                <HeadingSection
                                    as="h1"
                                    badge={t.pages.socialPartners.badge}
                                    title={t.pages.socialPartners.title}
                                    subtitle={t.pages.socialPartners.subtitle}
                                    className=""
                                >
                                    <Button variant="primary" href="/contact" className="mt-8">
                                        {t.pages.socialPartners.contactButton}
                                    </Button>
                                </HeadingSection>
            </Container>

            {/* How We Build Solutions */}
            <section className="w-full">
                <Container className="mb-24">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.howBadge}
                        title={t.pages.socialPartners.howTitle}
                        subtitle={t.pages.socialPartners.howSubtitle}
                        className="mb-12"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {localizedHowWeWork.map((item) => (
                            <div key={item.step} className="bg-[var(--bg-surface)] shadow-md rounded-2xl p-8 text-left hover:shadow-lg transition-shadow">
                                <span className="text-4xl font-bold text-[var(--accent-primary)] font-heading">{item.step}</span>
                            <h3 className="text-2xl md:text-[1.7rem] font-bold text-[var(--text-primary)] mt-4 mb-3 font-heading leading-tight min-h-[4.5rem]">{item.title}</h3>
                            <p className="text-[var(--text-secondary)]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Why Collaborate */}
            <section className="w-full">
                <Container className="mb-24">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.benefitsBadge}
                        title={t.pages.socialPartners.benefitsTitle}
                        className="mb-12"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-amber-200/60 bg-amber-50 dark:border-amber-300/20 dark:bg-amber-900/15 flex items-center justify-center mb-4 transition-colors duration-300">
                                <HandCoins className="w-7 h-7 text-amber-600 dark:text-amber-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.socialPartners[0][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[0][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-blue-200/60 bg-blue-50 dark:border-blue-300/20 dark:bg-blue-900/15 flex items-center justify-center mb-4 transition-colors duration-300">
                                <UsersRound className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.socialPartners[1][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[1][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-purple-200/60 bg-purple-50 dark:border-purple-300/20 dark:bg-purple-900/15 flex items-center justify-center mb-4 transition-colors duration-300">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.socialPartners[2][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[2][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-green-200/60 bg-green-50 dark:border-green-300/20 dark:bg-green-900/15 flex items-center justify-center mb-4 transition-colors duration-300">
                                <HandFist className="w-6 h-6 text-green-600 dark:text-green-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.socialPartners[3][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[3][1]}</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Partner Logos */}
            <section className="w-full">
                <Container className="mb-24">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.partnerBadge}
                        title={t.pages.socialPartners.partnerTitle}
                        className="mb-12"
                        hideBadge={false}
                    />
                    <div className="flex flex-wrap justify-center items-center gap-8 px-4">
                        {localizedPartners.map((partner, i) => (
                            <div key={i} className="w-full max-w-sm">
                                <PartnerCard
                                    variant="social"
                                    name={partner.name}
                                    logo={partner.logo}
                                    logoFallback={partner.logoFallback}
                                    description={partner.description}
                                />
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {featuredProjects.length > 0 && (
                <section className="w-full">
                    <Container className="mb-24">
                        <div className="flex flex-col items-center text-center mb-10 md:mb-12 px-2">
                            <SectionLabel>Selected Projects</SectionLabel>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-primary)] font-heading">
                                {t.pages.projects.title}
                            </h2>
                            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mt-4">
                                {t.pages.projects.ctaText}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {featuredProjects.map((project) => (
                                <ProjectCard key={project.id} project={project} onClick={() => window.location.href = '/projects'} />
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* CTA */}
            <CTASection variant="socialPartners" />
        </div>
    );
}

import IconHeadingGroup from '../components/ui/IconHeadingGroup';
import React, { useState } from 'react';
import ProjectDetails from '../components/cards/ProjectDetails';
import { ClipboardCheck, GraduationCap, HandHeart, UserCheck } from 'lucide-react';
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
import { assetUrl } from '../utils/assetUrl';
import './SocialPartnersPage.css';

// Deaktiviert bis wir echte Projekte mit Nonprofits abgeschlossen haben — wieder aktivieren wenn vorhanden.
const socialPartners = [
    // {
    //     name: 'Initiative Gruppe',
    //     logo: assetUrl('/cms/all-partner-logos/initiative-gruppe-coloured.svg'),
    //     logoFallback: assetUrl('/cms/all-partner-logos/initiative-gruppe-logo.png'),
    //     description: 'Supporting integration and education for migrants and refugees in Cologne through innovative AI-powered tools.',
    // },
    // {
    //     name: 'Entreculturas',
    //     logo: assetUrl('/cms/all-partner-logos/entreculturas-coloured.svg'),
    //     description: 'Leveraging AI to advance educational access and intercultural dialogue across communities worldwide.',
    // },
    // {
    //     name: 'Kulturator',
    //     logo: assetUrl('/cms/all-partner-logos/kulturator-coloured.svg'),
    //     description: 'Applying data-driven solutions to promote cultural engagement and preserve heritage.',
    // },
    // {
    //     name: 'UN Women',
    //     logo: assetUrl('/cms/all-partner-logos/Un-women-for-all-women-and-girls-coloured.png'),
    //     description: 'Building AI tools that empower gender equality initiatives and support women and girls globally.',
    // },
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
    const [selectedProject,setSelectedProject]=useState(null);
    const localizedHowWeWork = t.socialPartners.howWeWork.map(([step, title, text]) => ({ step, title, text }));
    const localizedPartners = socialPartners.map((partner) => ({
        ...partner,
        description: t.socialPartners.partners[partner.name] || partner.description,
    }));
    const featuredProjects = getProjects(locale).filter((project) => ['4', '8', '7'].includes(project.id));

    return (
        <div className="flex flex-col items-center pt-0 pb-12">
            <Seo title={t.pages.socialPartners.title} description={t.pages.socialPartners.subtitle} />
            {/* Hero */}
            <Container className="section-block">
                                <HeadingSection
                                    as="h1"
                                    badge={t.pages.socialPartners.badge}
                                    title={t.pages.socialPartners.title}
                                    subtitle={t.pages.socialPartners.subtitle}
                                    className=""
                                >
                                    <Button variant="primary" href="/contact">
                                        {t.pages.socialPartners.contactButton}
                                    </Button>
                                </HeadingSection>
            </Container>

            {/* How We Build Solutions */}
            <section className="w-full">
                <Container className="section-block">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.howBadge}
                        title={t.pages.socialPartners.howTitle}
                        subtitle={t.pages.socialPartners.howSubtitle}
                        className="mb-12"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {localizedHowWeWork.map((item) => (
                            <div key={item.step} className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 text-left hover:shadow-lg transition-shadow">
                                <span className="text-5xl font-bold text-[var(--accent-primary)] font-heading">{Number(item.step)}</span>
                            <h3 className="text-[length:var(--type-card-title)] font-bold text-[var(--text-primary)] mt-4 mb-3 font-heading leading-heading min-h-[4.5rem]">{item.title}</h3>
                            <p className="text-[var(--text-secondary)]">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Why Collaborate */}
            <section className="w-full">
                <Container className="section-block">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.benefitsBadge}
                        title={t.pages.socialPartners.benefitsTitle}
                        className="mb-12"
                    />
                    <IconHeadingGroup maxFontSize={30} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--amber flex items-center justify-center transition-colors duration-300">
                                    <GraduationCap className="w-7 h-7" />
                                </div>
                                <h3 className="icon-aligned-heading min-w-0 text-3xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.partnerBenefits.socialPartners[0][0]}</h3>
                            </div>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[0][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--blue flex items-center justify-center transition-colors duration-300">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <h3 className="icon-aligned-heading min-w-0 text-3xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.partnerBenefits.socialPartners[1][0]}</h3>
                            </div>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[1][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--purple flex items-center justify-center transition-colors duration-300">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                <h3 className="icon-aligned-heading min-w-0 text-3xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.partnerBenefits.socialPartners[2][0]}</h3>
                            </div>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[2][1]}</p>
                        </div>

                        <div className="bg-[var(--bg-surface)] shadow-md rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl border collaboration-icon collaboration-icon--green flex items-center justify-center transition-colors duration-300">
                                    <HandHeart className="w-6 h-6" />
                                </div>
                                <h3 className="icon-aligned-heading min-w-0 text-3xl font-bold text-[var(--text-primary)] font-heading leading-heading">{t.partnerBenefits.socialPartners[3][0]}</h3>
                            </div>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.socialPartners[3][1]}</p>
                        </div>
                    </IconHeadingGroup>
                </Container>
            </section>

            {/* Partner Logos */}
            {localizedPartners.length > 0 && (
            <section className="w-full">
                <Container className="section-block">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.socialPartners.partnerBadge}
                        title={t.pages.socialPartners.partnerTitle}
                        className="mb-12"
                        hideBadge={false}
                    />
                    <div className="social-partner-grid">
                        {localizedPartners.map(partner => (
                            <div key={partner.name} className="social-partner-grid-item">
                                <PartnerCard
                                    variant="social"
                                    name={partner.name}
                                    logo={partner.logo}
                                    logoFallback={partner.logoFallback}
                                    description={partner.description}
                                    website={partner.website}
                                />
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
            )}

            {featuredProjects.length > 0 && (
                <section className="w-full">
                    <Container className="section-block">
                        <div className="flex flex-col items-center text-center mb-10 md:mb-12 px-2">
                            <SectionLabel>{locale === 'de' ? 'Ausgewählte Projekte' : 'Selected Projects'}</SectionLabel>
                            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-primary)] font-heading">
                                {t.pages.projects.title}
                            </h2>
                            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mt-4">
                                {t.pages.projects.ctaText}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {featuredProjects.map((project, index) => (
                                <div
                                    key={project.id}
                                    className={`h-full ${featuredProjects.length % 2 === 1 && index === featuredProjects.length - 1
                                        ? 'md:col-span-2 md:w-[calc((100%-1.5rem)/2)] md:justify-self-center xl:col-span-1 xl:w-full'
                                        : ''}`}
                                >
                                    <ProjectCard project={project} onClick={() => setSelectedProject(project)} />
                                </div>
                            ))}
                        </div>
                        <div className="section-followup">
                            <p className="text-secondary">{t.pages.socialPartners.projectsPrompt}</p>
                            <Button variant="primary" href="/projects">
                                {locale === 'de'?'Alle Projekte entdecken':'Explore all projects'}
                            </Button>
                        </div>
                    </Container>
                </section>
            )}

            {selectedProject && <ProjectDetails project={selectedProject} projects={getProjects(locale)} onClose={()=>setSelectedProject(null)}/>}
            {/* CTA */}
            <CTASection variant="socialPartners" />
        </div>
    );
}

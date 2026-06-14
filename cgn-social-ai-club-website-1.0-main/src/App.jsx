import HeroSection from './components/sections/HeroSection';
import TeamPhotoSection from './components/sections/TeamPhotoSection';
import AboutSection from './components/sections/AboutSection';
import ProjectsSection from './components/sections/ProjectsSection';
import SponsorsSectionFull from './components/sections/SponsorsSectionFull';
// import PartnerMarquee from './components/ui/PartnerMarquee'; // Deaktiviert bis Partner vorhanden
import ContactSection from './components/sections/ContactSection';
import NetworkSection from './components/sections/NetworkSection';
import SocialsSection from './components/sections/SocialsSection';
import CTASection from './components/sections/CTASection';
import Aurora from './components/Aurora';
import React from 'react';
import Seo from './components/ui/Seo';
import { SITE_URL } from './utils/seoRoutes';
import { useLocale } from './i18n/LocaleContext';

function App() {
    const { locale, t } = useLocale();
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'NonprofitOrganization',
        name: 'CGN Social AI Club e.V.',
        alternateName: 'CGN Social AI Club',
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logos/CGN-Social-AI-Club-stacked-dark-text.svg`,
        email: 'contact@cgn-socialaiclub.de',
        description: t.home.heroDescription,
        foundingLocation: {
            '@type': 'Place',
            name: 'Cologne, Germany',
        },
        areaServed: [
            {
                '@type': 'Country',
                name: 'Germany',
            },
        ],
        affiliation: {
            '@type': 'Organization',
            name: 'CGN Social AI Club',
            sameAs: SITE_URL,
        },
        knowsAbout: [
            'Artificial Intelligence',
            'Machine Learning',
            'AI for Good',
            'Social Impact',
            'Environmental Impact',
            'Nonprofit Technology',
            'Student Community',
        ],
        sameAs: [
            'https://www.linkedin.com/company/cgnsocialaiclub',
        ],
    };
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CGN Social AI Club',
        url: SITE_URL,
        inLanguage: locale,
        publisher: {
            '@type': 'NonprofitOrganization',
            name: 'CGN Social AI Club e.V.',
            url: SITE_URL,
        },
    };

    return (
        <div className="flex flex-col items-start justify-start pt-4 pb-12">
            <Seo
                title={locale === 'de' ? 'Deutschlands erste studentische AI-for-Good-Initiative' : "Germany's First AI for Good Student Initiative"}
                description={t.home.heroDescription}
                structuredData={[organizationSchema, websiteSchema]}
            />
            <div className="relative w-full min-h-[55vh] flex items-center justify-center overflow-hidden -mt-28 pt-24">
                <div className="absolute inset-0 w-full h-full">
                    <Aurora
                        colorStops={['#4BFFC0', '#4A98FF', '#0a2d57']}
                        blend={0.5}
                        amplitude={1.0}
                        speed={0.8}
                    />
                </div>
                <div className="relative z-10 w-full">
                    <HeroSection />
                </div>
            </div>
            {/* Partner-Marquee — wieder aktivieren wenn Partner vorhanden:
            <div className="w-full mb-2" id="partners">
                <PartnerMarquee />
            </div>
            */}
            <div className="w-full h-[180px] md:h-[206px]" aria-hidden="true" />
            <TeamPhotoSection />
            <AboutSection />
            <ProjectsSection />
            <SponsorsSectionFull />
            <NetworkSection />
            <SocialsSection />
            <CTASection />
        </div>
    );
}

export default App

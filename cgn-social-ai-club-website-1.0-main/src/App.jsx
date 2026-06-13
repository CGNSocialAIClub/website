import HeroSection from './components/sections/HeroSection';
import TeamPhotoSection from './components/sections/TeamPhotoSection';
import AboutSection from './components/sections/AboutSection';
import ProjectsSection from './components/sections/ProjectsSection';
import SponsorsSectionFull from './components/sections/SponsorsSectionFull';
import PartnerMarquee from './components/ui/PartnerMarquee';
import ContactSection from './components/sections/ContactSection';
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
        name: 'TUM Social AI Club e.V.',
        alternateName: 'TUM Social AI Club',
        url: SITE_URL,
        logo: `${SITE_URL}/assets/logos/LOGO_V6-ICON+TUM-SOCIAL-CLUB_stacked-dark-text.svg`,
        email: 'contact@tum-socialaiclub.de',
        description: t.home.heroDescription,
        foundingLocation: {
            '@type': 'Place',
            name: 'Munich, Germany',
        },
        areaServed: [
            {
                '@type': 'Country',
                name: 'Germany',
            },
        ],
        affiliation: {
            '@type': 'CollegeOrUniversity',
            name: 'Technical University of Munich',
            sameAs: 'https://www.tum.de',
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
            'https://www.linkedin.com/company/tumsocialaiclub',
        ],
    };
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'TUM Social AI Club',
        url: SITE_URL,
        inLanguage: locale,
        publisher: {
            '@type': 'NonprofitOrganization',
            name: 'TUM Social AI Club e.V.',
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
            <div className="w-full mb-2" id="partners">
                <PartnerMarquee />
            </div>
            <TeamPhotoSection />
            <AboutSection />
            <ProjectsSection />
            <SponsorsSectionFull />
            <SocialsSection />
            <CTASection />
        </div>
    );
}

export default App

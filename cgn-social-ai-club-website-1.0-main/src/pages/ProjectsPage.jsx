import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import ProjectsSection from '../components/sections/ProjectsSection';
import CTASection from '../components/sections/CTASection';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function ProjectsPage() {
    const { t } = useLocale();

    return (
        <div className="flex flex-col items-center pt-0 pb-12">
            <Seo title={t.pages.projects.title} description={t.pages.projects.subtitle} />

            <Container>
                <HeadingSection
                    as="h1"
                    badge={t.pages.projects.badge}
                    title={t.pages.projects.title}
                    subtitle={t.pages.projects.subtitle}
                    className=""
                />
            </Container>

            <ProjectsSection />

            <CTASection
                heading={t.pages.projects.ctaHeading}
                text={t.pages.projects.ctaText}
                buttons={[
                    { label: t.pages.projects.ctaPrimary, href: '/contact', variant: 'primary' },
                    { label: t.pages.projects.ctaSecondary, href: '/social-partners', variant: 'tertiary' },
                ]}
            />
        </div>
    );
}

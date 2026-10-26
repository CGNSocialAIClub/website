
import CTASection from '../components/sections/CTASection';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import ContactSection from '../components/sections/ContactSection';
import SocialsSection from '../components/sections/SocialsSection';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function ContactPage() {
    const { t, locale } = useLocale();

    return (
        <>
            <Seo title={t.pages.contact.title} description={t.pages.contact.subtitle} />
            <div className="pb-20">
                <Container className="flex flex-col items-center">
                    <HeadingSection
                      as="h1"
                      badge={t.pages.contact.badge}
                      title={t.pages.contact.title}
                      subtitle={
                        <span>
                            {t.pages.contact.subtitle.split('contact@cologne-socialaiclub.de')[0]}
                            <a
                                href="mailto:contact@cologne-socialaiclub.de"
                                className="text-[var(--text-primary)] hover:text-[var(--text-accent)] hover:underline transition-colors font-medium"
                            >
                                contact@cologne-socialaiclub.de
                            </a>
                            {t.pages.contact.subtitle.split('contact@cologne-socialaiclub.de')[1]}
                        </span>
                      }
                      className=""
                    />
                    <ContactSection />
                </Container>
            </div>
            <SocialsSection />
            <CTASection heading={locale==='de'?'Lerne uns näher kennen.':'Get to know us.'} text={locale==='de'?'Die Menschen hinter den Projekten und die Arbeit, die uns zusammenbringt.':'Meet the people behind the projects and see what we are working on.'} buttons={[
                {label:t.cta.students.buttons[1],href:'/team',variant:'primary'},
                {label:t.cta.members.buttons[1],href:'/projects',variant:'tertiary'},
            ]}/>
        </>
    );
}


import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import ContactSection from '../components/sections/ContactSection';
import SocialsSection from '../components/sections/SocialsSection';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function ContactPage() {
    const { t } = useLocale();

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
                            {t.pages.contact.subtitle.split('contact@cgn-socialaiclub.de')[0]}
                            <a 
                                href="mailto:contact@cgn-socialaiclub.de" 
                                className="text-[var(--text-secondary)] hover:underline transition-colors font-medium"
                            >
                                contact@cgn-socialaiclub.de
                            </a>
                            {t.pages.contact.subtitle.split('contact@cgn-socialaiclub.de')[1]}
                        </span>
                      }
                      className=""
                    />
                    <ContactSection />
                </Container>
            </div>
            <SocialsSection />
        </>
    );
}

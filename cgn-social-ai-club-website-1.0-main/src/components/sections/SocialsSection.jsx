import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import SocialCard from '../cards/SocialCard';
import { useLocale } from '../../i18n/LocaleContext';

export default function SocialsSection() {
    const { t } = useLocale();

    return (
        <section id="events" className="w-full py-16">
            <Container className="flex flex-col items-center">
                <div className="text-center mb-12 md:mb-16 space-y-4 px-2">
                    <SectionLabel>{t.home.socialsBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-heading">
                        {t.home.socialsTitle}
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 w-full max-w-5xl">
                    <SocialCard
                        name="LinkedIn"
                        description={t.home.socialsLinkedinDescription}
                        href="https://www.linkedin.com/company/tumsocialaiclub"
                        icon={
                            <img
                                src="/assets/socials-logos/LinkedIn-app-icon.png"
                                alt="LinkedIn"
                                className="w-12 h-12 object-contain rounded-[12px]"
                                loading="lazy"
                            />
                        }
                    />
                </div>
            </Container>
        </section>
    );
}

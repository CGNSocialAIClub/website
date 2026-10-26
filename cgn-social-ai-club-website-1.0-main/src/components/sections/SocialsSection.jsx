import IconHeadingGroup from '../ui/IconHeadingGroup';
import SocialIconFallback from '../ui/SocialIconFallback';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import SocialCard from '../cards/SocialCard';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

export default function SocialsSection() {
    const { t } = useLocale();

    return (
        <section id="socials" className="w-full section-block">
            <Container className="flex flex-col items-center">
                <div className="text-center mb-12 md:mb-16 space-y-4 px-2">
                    <SectionLabel>{t.home.socialsBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-heading">
                        {t.home.socialsTitle}
                    </h2>
                </div>

                <IconHeadingGroup maxFontSize={30} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
                    <SocialCard
                        name="LinkedIn"
                        description={t.home.socialsLinkedinDescription}
                        href="https://www.linkedin.com/company/cgn-socialaiclub/"
                        icon={
                            <OptimizedImage
                                src="/assets/socials-logos/LinkedIn-app-icon.png"
                                            fallback={<SocialIconFallback service="linkedin" size={48} />}
                                alt="LinkedIn"
                                className="w-12 h-12 object-contain rounded-[12px]"
                                loading="lazy"
                            />
                        }
                    />
                    <SocialCard
                        name="Instagram"
                        description={t.home.socialsInstagramDescription}
                        href="https://www.instagram.com/cgnsocialaiclub"
                        icon={
                            <OptimizedImage
                                src="/assets/socials-logos/instagram-app-icon.png"
                                            fallback={<SocialIconFallback service="instagram" size={48} />}
                                alt="Instagram"
                                className="w-12 h-12 object-contain rounded-[12px]"
                                loading="lazy"
                            />
                        }
                    />
                </IconHeadingGroup>
            </Container>
        </section>
    );
}

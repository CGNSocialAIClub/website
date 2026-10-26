import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import Button from '../ui/Button';
import ClubPhoto from '../ui/ClubPhoto';
import { useLocale } from '../../i18n/LocaleContext';

export default function CommunityStorySection() {
    const { t } = useLocale();
    return (
        <section className="w-full section-block">
            <Container>
                <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-xl">
                        <SectionLabel>{t.home.communityBadge}</SectionLabel>
                        <h2 className="mt-4 font-heading text-4xl font-bold leading-[1.05] md:text-6xl">{t.home.communityTitle}</h2>
                    </div>
                    <div className="max-w-md">
                        <p className="mb-5 text-lg leading-relaxed text-[var(--text-secondary)]">{t.home.communityText}</p>
                        <Button variant="secondary" href="/team">{t.home.communityLink}</Button>
                    </div>
                </div>
                <div className="grid items-start gap-4 md:grid-cols-[1.35fr_1fr] md:gap-6">
                    <ClubPhoto name="community-applause" alt={t.home.applausePhotoAlt} className="aspect-[4/3] md:aspect-[3/2]" />
                    <ClubPhoto name="community-talk" alt={t.home.talkPhotoAlt} className="aspect-[3/2] md:mt-16 md:aspect-[4/3]" />
                </div>
            </Container>
        </section>
    );
}

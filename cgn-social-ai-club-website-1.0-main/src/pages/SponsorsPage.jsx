import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import SponsorsSection from '../components/sections/SponsorsSection';
import CTASection from '../components/sections/CTASection';
import Button from '../components/ui/Button';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function SponsorsPage() {
        const { t } = useLocale();
        return (
                <div className="flex flex-col items-center pt-0 pb-12">
                        <Seo title={t.pages.sponsors.title} description={t.pages.sponsors.subtitle} />
                        {/* Hero */}
                        <Container>
                        <HeadingSection
                            as="h1"
                            badge={t.pages.sponsors.badge}
                            title={t.pages.sponsors.title}
                            subtitle={t.pages.sponsors.subtitle}
                            className=""
                        >
                                    <Button variant="primary" href="/contact" className="mt-8">
                                        {t.pages.sponsors.heroButton}
                                    </Button>
                                </HeadingSection>
                        </Container>

            {/* Opportunity */}
            <section className="w-full">
                <Container className="mb-24">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.sponsors.opportunitiesBadge}
                        title={t.pages.sponsors.opportunitiesTitle}
                        className="mb-12"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-blue-200/60 bg-blue-50 dark:border-blue-300/20 dark:bg-blue-900/15 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.sponsors[0][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.sponsors[0][1]}</p>
                        </div>
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-amber-200/60 bg-amber-50 dark:border-amber-300/20 dark:bg-amber-900/15 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-amber-600 dark:text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.sponsors[1][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.sponsors[1][1]}</p>
                        </div>
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-purple-200/60 bg-purple-50 dark:border-purple-300/20 dark:bg-purple-900/15 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.sponsors[2][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.sponsors[2][1]}</p>
                        </div>
                        <div className="bg-[var(--bg-surface)] shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl border border-green-200/60 bg-green-50 dark:border-green-300/20 dark:bg-green-900/15 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading mb-3">{t.partnerBenefits.sponsors[3][0]}</h3>
                            <p className="text-[var(--text-secondary)]">{t.partnerBenefits.sponsors[3][1]}</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Current Strategic Partners */}
            <section className="w-full">
                <Container className="mb-24">
                    <HeadingSection
                        as="h2"
                        badge={t.pages.sponsors.badge}
                        title={t.pages.sponsors.partnerTitle}
                        className="mb-12"
                    />
                    <SponsorsSection hideCTA />
                </Container>
            </section>

            {/* CTA */}
            <CTASection variant="sponsors" />
        </div>
    );
}

import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import HeadingSection from '../components/ui/HeadingSection';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';
import RunnerGame from '../components/ui/RunnerGame';

export default function NotFound() {
    const { t } = useLocale();
    return (
        <div className="min-h-[80vh] flex items-center justify-center pt-10 pb-10">
            <Seo
                title={t.pages.notFound.title}
                description={t.pages.notFound.subtitle}
                url="https://tum-socialaiclub.de/404"
                noIndex
            />
            <Container>
                <div className="max-w-2xl mx-auto text-center space-y-12">
                    <HeadingSection
                        as="h1"
                        badge={t.pages.notFound.badge}
                        title={t.pages.notFound.title}
                        subtitle={t.pages.notFound.subtitle}
                        className="mt-0 mb-0"
                    />

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium transition-colors px-6 py-3"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {t.pages.notFound.goBack}
                        </button>
                    </div>

                    <div className="py-2">
                        <RunnerGame />
                    </div>

                    <div className="pt-10 border-t border-[var(--border-default)]">
                        <p className="text-[var(--text-secondary)] mb-4">
                            {t.pages.notFound.help}
                        </p>
                        <Link to="/contact">
                            <Button variant="primary" className="px-8">
                                {t.pages.notFound.contact}
                            </Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}

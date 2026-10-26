import OptimizedImage from '../ui/OptimizedImage';
import { useLocale } from '../../i18n/LocaleContext';

export default function TeamGroupPhoto({ className = '' }) {
    const { locale } = useLocale();

    return (
        <figure className={`relative aspect-[8/5] w-full min-w-0 overflow-hidden rounded-3xl border border-[var(--border-subtle)] ${className}`}>
            <OptimizedImage
                src="/cms/team/team-kickoff.jpg"
                alt={locale === 'de' ? 'Unser Team beim Kickoff der zweiten Generation' : 'Our team at the second-generation kickoff'}
                className="absolute inset-0 h-full w-full object-cover object-bottom"
                sizes="(min-width:1280px) 1100px, 100vw"
                loading="lazy"
            />
        </figure>
    );
}

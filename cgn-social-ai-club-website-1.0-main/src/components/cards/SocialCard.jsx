import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';

export default function SocialCard({
    name,
    description,
    icon,
    href,
    iconColor = "text-primary",
    buttonText = null
}) {
    const { locale } = useLocale();
    const effectiveButtonText = buttonText || (locale === 'de' ? 'Folgen' : 'Follow us');

    return (
        <div className="flex flex-col justify-between p-4 md:p-6 rounded-3xl bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-all duration-300 h-full border border-[var(--border-subtle)] w-full max-w-[480px] mx-auto">
            <div>
                {/* Icon */}
                <div className="mb-3">
                    {icon}
                </div>

                {/* Title */}
                <h3 className="text-[28px] font-bold text-[var(--text-primary)] mb-2 font-heading">
                    {name}
                </h3>

                {/* Description */}
                <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4">
                    {description}
                </p>
            </div>

            {/* Button */}
            <div>
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button variant="glass" className="gap-2 font-bold">
                        {effectiveButtonText}
                    </Button>
                </a>
            </div>
        </div>
    );
}

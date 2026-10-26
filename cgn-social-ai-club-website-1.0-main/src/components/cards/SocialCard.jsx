import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import { openSocialAppLink } from '../../utils/socialAppLinks';

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
                <div className="mb-4 flex items-center gap-4">
                    <div className="shrink-0">{icon}</div>
                    <h3 className="icon-aligned-heading min-w-0 text-3xl font-bold text-[var(--text-primary)] font-heading leading-heading break-words">
                        {name}
                    </h3>
                </div>

                {/* Description */}
                <p className="text-[var(--text-secondary)] text-base leading-relaxed mb-4">
                    {description}
                </p>
            </div>

            {/* Button */}
            <div>
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => openSocialAppLink(event, href)}
                    className="inline-block"
                >
                    <Button variant="secondary" className="gap-2 font-bold">
                        {effectiveButtonText}
                    </Button>
                </a>
            </div>
        </div>
    );
}

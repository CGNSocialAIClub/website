import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';
import { areApplicationsOpen } from '../../config/features';

// Announcement pill above the hero logo; scrolls down to the recruiting banner.
export default function RecruitingPill() {
    const { t } = useLocale();
    const copy = t.home.recruiting;
    const label = areApplicationsOpen() ? copy.pillOpen : copy.pillBefore;

    const scrollToBanner = () => {
        document.getElementById('recruiting')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <button
            type="button"
            onClick={scrollToBanner}
            className="group inline-flex max-w-full items-center gap-2.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-glass)] py-1.5 pl-1.5 pr-4 font-body text-sm font-semibold text-[var(--text-primary)] shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[var(--border-strong)] hover:shadow-md md:text-[15px]"
        >
            <span className="recruiting-pill-icon relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A2D57] ring-1 ring-[#4BFFC0]/40">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 1.5C12.9 8.4 15.6 11.1 22.5 12 15.6 12.9 12.9 15.6 12 22.5 11.1 15.6 8.4 12.9 1.5 12 8.4 11.1 11.1 8.4 12 1.5Z" fill="#4BFFC0" />
                </svg>
            </span>
            <span className="text-left leading-snug">{label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </button>
    );
}

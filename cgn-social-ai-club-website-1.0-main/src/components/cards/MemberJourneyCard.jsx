import React from 'react';

export default function MemberJourneyCard({ icon, title, description, highlight, badge, borderColor, className = '', style }) {
    return (
        <div style={style} className={`relative bg-[var(--bg-surface)] rounded-3xl shadow-lg border p-6 md:p-8 flex flex-col gap-3 ${borderColor ? borderColor : 'border-[var(--border-default)]'} ${highlight ? 'ring-2 ring-green-400/30' : ''} ${className}`}>
            {badge && (
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-md ${badge === 'Current Focus' ? 'bg-green-500 text-white' : 'bg-[var(--bg-accent)] text-[var(--text-inverse)]'}`}>
                    {badge}
                </span>
            )}
            <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-surface-subtle)] flex-shrink-0">
                    {icon}
                </div>
                <span className="text-lg font-semibold text-[var(--text-primary)] font-heading pt-1.5">
                    {title}
                </span>
            </div>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed">
                {description}
            </p>
        </div>
    );
}

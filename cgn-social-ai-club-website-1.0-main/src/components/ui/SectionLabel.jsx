import React from 'react';

export default function SectionLabel({ children }) {
    return (
        <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] font-body font-semibold text-sm tracking-wide mb-6 uppercase border border-[var(--border-subtle)]">
            {children}
        </span>
    );
}

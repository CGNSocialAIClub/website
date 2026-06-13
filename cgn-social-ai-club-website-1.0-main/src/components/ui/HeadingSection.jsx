import React from 'react';
import SectionLabel from './SectionLabel';

/**
 * HeadingSection component for consistent hero/section headers.
 * @param {string} title - Main heading text (required)
 * @param {string} subtitle - Subtitle/description text (optional)
 * @param {string} badge - Badge/label text (optional)
 * @param {boolean} hideBadge - If true, badge is not shown
 * @param {string} className - Additional classes for wrapper
 * @param {React.ReactNode} children - Optional children (rarely needed)
 */
export default function HeadingSection({
  title,
  subtitle,
  badge,
  hideBadge = false,
  className = '',
  children,
  as = 'h2',
}) {
  const TitleTag = as;

  return (
    <div className={`flex flex-col items-center text-center pt-4 md:pt-12 mb-10 md:mb-12 ${className}`}>
      {/* Badge/Label */}
      {!hideBadge && badge && (
        <div className="mb-5 md:mb-6">
          <SectionLabel>{badge}</SectionLabel>
        </div>
      )}

      {/* Main Title */}
      {title && (
        <TitleTag className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-[var(--text-primary)] mb-5 md:mb-6 max-w-4xl px-2">
          {typeof title === 'string'
            ? title.split('\n').map((part, index, array) => (
                <React.Fragment key={`${part}-${index}`}>
                  {part}
                  {index < array.length - 1 && <br />}
                </React.Fragment>
              ))
            : title}
        </TitleTag>
      )}

      {/* Subtitle/Description */}
      {subtitle && (
        <p className="text-lg sm:text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed px-2">
          {subtitle}
        </p>
      )}

      {/* Optional extra content (like buttons) */}
      {children && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {children}
        </div>
      )}
    </div>
  );
}

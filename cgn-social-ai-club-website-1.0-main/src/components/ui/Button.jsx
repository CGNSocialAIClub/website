import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ArrowUpRight } from 'lucide-react';

export default function Button({
    children,
    variant = 'primary',
    className,
    href,
    ...props
}) {
    const buttonRef = useRef(null);
    const [mouseX, setMouseX] = useState(0.5);
    const [mouseY, setMouseY] = useState(0.5);

    const handlePointerMove = (e) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        setMouseX((e.clientX - rect.left) / rect.width);
        setMouseY((e.clientY - rect.top) / rect.height);
        if (props.onPointerMove) props.onPointerMove(e);
    };

    const baseStyles = "group relative inline-flex shrink-0 items-center justify-center rounded-[1rem] pt-[14px] pb-[13px] px-[22px] transition-all duration-300 font-body text-[length:var(--type-body)] leading-[1.2em] font-bold cursor-pointer whitespace-nowrap";

    const variants = {
        gradient: "ui-button-gradient bg-gradient-to-r from-[#a2f2de] to-[#80b6ff] backdrop-blur-md text-[#0a2d57] border border-[var(--border-default)] shadow-sm active:shadow-md",
        primary: "ui-button-primary bg-[var(--button-primary-bg)] text-[var(--text-inverse)] border border-[var(--button-primary-border)] shadow-sm active:bg-[var(--button-primary-hover)] active:shadow-md",
        secondary: "ui-button-secondary bg-[var(--button-secondary-bg)] text-[var(--bg-accent)] border border-[var(--border-default)] shadow-sm active:bg-[var(--button-secondary-hover)] active:shadow-md",
        'always-white': "ui-button-always-white bg-[var(--button-light-bg)] backdrop-blur-md text-[#0a2d57] border border-[var(--button-light-border)] shadow-sm active:bg-[var(--button-light-hover)] active:shadow-md",
        'always-dark': "ui-button-always-dark bg-[var(--button-dark-bg)] backdrop-blur-md text-[#ffffff] border border-[var(--button-dark-border)] shadow-sm active:bg-[var(--button-dark-hover)] active:shadow-md",
        tertiary: "ui-button-tertiary bg-transparent text-[var(--text-primary)] border border-transparent active:border-[var(--border-default)] active:bg-[var(--active-overlay)]",
    };

    const isExternalWebsiteHref = typeof href === 'string' && /^https?:\/\//i.test(href);
    const isExternalHref = typeof href === 'string' && /^(https?:|mailto:|tel:)/i.test(href);
    const isHashOnlyHref = typeof href === 'string' && href.startsWith('#');
    const useRouterLink = Boolean(href) && !isExternalHref && !isHashOnlyHref && !props.target;

    const mergedProps = {
        ref: buttonRef,
        onPointerMove: handlePointerMove,
        className: twMerge(baseStyles, variants[variant], className),
        style: {
            ...props.style,
            "--mx": `${mouseX * 100}%`,
            "--my": `${mouseY * 100}%`
        },
        ...(isExternalWebsiteHref ? {
            target: '_blank',
            rel: 'noopener noreferrer',
        } : {}),
        ...props
    };

    if (useRouterLink) {
        return (
            <Link to={href} {...mergedProps}>
                <span className="relative z-10 inline-flex items-center justify-center gap-2 text-center [&>svg]:block [&>svg]:shrink-0">{children}</span>
            </Link>
        );
    }

    const Component = href ? 'a' : 'button';

    return (
        <Component href={href} {...mergedProps}>
            <span className="relative z-10 inline-flex items-center justify-center gap-2 text-center [&>svg]:block [&>svg]:shrink-0">{children}{isExternalWebsiteHref && <ArrowUpRight size={16} aria-hidden="true"/>}</span>
        </Component>
    );
}

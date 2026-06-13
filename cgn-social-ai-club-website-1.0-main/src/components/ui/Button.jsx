import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

    const baseStyles = "group relative inline-flex items-center justify-center rounded-[1rem] pt-[14px] pb-[13px] px-[22px] transition-all duration-300 font-body text-[16px] leading-[1.2em] font-bold cursor-pointer whitespace-nowrap";

    const variants = {
        primary: "bg-[var(--bg-accent)] text-[var(--text-inverse)] hover:bg-[var(--bg-accent-hover)] border border-transparent shadow-lg hover:shadow-xl shadow-sm hover:shadow-md",
        secondary: "bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-subtle)] shadow-md hover:shadow-lg shadow-sm hover:shadow-md",
        tertiary: "bg-transparent text-[var(--text-primary)] border border-transparent hover:border-[var(--border-default)] hover:bg-[var(--active-overlay)]",
        glass: "bg-[var(--bg-surface-glass)] backdrop-blur-md border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--active-overlay)] shadow-sm hover:shadow-md"
    };

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
        ...props
    };

    if (useRouterLink) {
        return (
            <Link to={href} {...mergedProps}>
                <span className="relative z-10">{children}</span>
            </Link>
        );
    }

    const Component = href ? 'a' : 'button';

    return (
        <Component href={href} {...mergedProps}>
            <span className="relative z-10">{children}</span>
        </Component>
    );
}

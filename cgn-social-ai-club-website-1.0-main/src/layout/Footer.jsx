import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import React, { useState } from 'react';
import SocialIconFallback from '../components/ui/SocialIconFallback';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import LanguageToggle from '../components/ui/LanguageToggle';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useLocale } from '../i18n/LocaleContext';
import { FEATURES } from '../config/features';
import { openSocialAppLink } from '../utils/socialAppLinks';


export default function Footer() {
    const [logoFailed, setLogoFailed] = useState(false);
    const { t } = useLocale();
    const currentYear = new Date().getFullYear();
    const handleFooterNavClick = () => {
        window.scrollTo({ top: 0, left: window.scrollX, behavior: 'auto' });
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, left: window.scrollX, behavior: 'auto' });
        });
    };

    const pages = [
        { name: t.footer.home, href: '/' },
        { name: t.footer.projects, href: '/projects' },
        ...(FEATURES.events ? [{ name: 'Events', href: '/events' }] : []),
        { name: t.footer.community, href: '/team' },
        { name: t.footer.application, href: '/application' },
        { name: t.footer.nonprofits, href: '/social-partners' },
        { name: t.footer.partners, href: '/sponsors' },
    ];

    const information = [
        { name: t.footer.contact, href: '/contact', isRoute: true },
        { name: t.footer.privacy, href: '/privacy', isRoute: true },
        { name: t.footer.imprint, href: '/imprint', isRoute: true },
    ];

    return (
        <footer className="w-full pb-4 px-4">
            <div className="mx-auto w-full max-w-[calc(var(--content-max-width)-2rem)]">
                <div className="bg-[var(--bg-surface-glass)] backdrop-blur-md rounded-[24px] p-6 md:p-8 lg:p-10 text-[var(--text-primary)] shadow-lg border border-[var(--border-default)]">
                    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-6">

                        {/* Brand Column */}
                        <div className="flex flex-col gap-4 max-w-sm">
                            <div className="flex items-center gap-2">
                                {logoFailed ? <span aria-label="CGN Social AI Club" style={{ display: 'flex', flexDirection: 'column', fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 0.95 }}><span>CGN</span><span>SOCIAL AI</span><span>CLUB</span></span> : <Logo className="h-10 md:h-11" v6Full onError={() => setLogoFailed(true)} />}
                            </div>

                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                {t.footer.tagline.split('\n').map((line) => (
                                    <React.Fragment key={line}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <a
                                    href="https://www.linkedin.com/company/cgn-socialaiclub/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => openSocialAppLink(event, 'https://www.linkedin.com/company/cgn-socialaiclub/')}
                                    className="flex h-11 w-11 items-center justify-center hover:opacity-90 transition-opacity"
                                    aria-label="LinkedIn"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[9px] bg-white">
                                        <OptimizedImage
                                            src="/assets/socials-logos/LinkedIn-app-icon.png"
                                            fallback={<SocialIconFallback service="linkedin" />}
                                            alt="LinkedIn"
                                            className="h-full w-full object-cover"
                                        />
                                    </span>
                                </a>
                                <a
                                    href="mailto:contact@cologne-socialaiclub.de"
                                    className="flex h-11 w-11 items-center justify-center hover:opacity-90 transition-opacity"
                                    aria-label="Email"
                                >
                                    <span className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-[#d7dce3] bg-[#0a2d57] text-white">
                                        <Mail className="h-6 w-6" />
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Links Container */}
                        <div className="flex gap-16 md:gap-24 flex-wrap">
                            {/* Pages Column */}
                            <div className="flex flex-col gap-4">
                                <h4 className="footer-column-title font-body font-bold text-base uppercase text-[var(--text-primary)]">{t.footer.pages}</h4>
                                <nav className="flex flex-col gap-4">
                                    {pages.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.href}
                                            onClick={handleFooterNavClick}
                                            className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors font-medium"
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* Information Column */}
                            <div className="flex flex-col gap-4">
                                <h4 className="footer-column-title font-body font-bold text-base uppercase text-[var(--text-primary)]">{t.footer.information}</h4>
                                <nav className="flex flex-col gap-4">
                                    {information.map((link) => (
                                        link.onClick ? (
                                            <button
                                                key={link.name}
                                                type="button"
                                                onClick={link.onClick}
                                                className="text-left text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors font-medium"
                                            >
                                                {link.name}
                                            </button>
                                        ) : link.isRoute ? (
                                            <Link
                                                key={link.name}
                                                to={link.href}
                                                onClick={handleFooterNavClick}
                                                className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors font-medium"
                                            >
                                                {link.name}
                                            </Link>
                                        ) : (
                                            <a
                                                key={link.name}
                                                href={link.href}
                                                className="text-[var(--text-secondary)] hover:text-[var(--text-accent)] transition-colors font-medium"
                                            >
                                                {link.name}
                                            </a>
                                        )
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex flex-col gap-6 md:flex-row md:justify-between md:items-center">
                        <p className="text-[var(--text-secondary)] text-sm text-left">
                            © {currentYear} CGN Social AI Club e.V.
                        </p>
                        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4">
                            <LanguageToggle />
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

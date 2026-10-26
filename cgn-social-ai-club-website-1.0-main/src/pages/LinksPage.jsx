import SocialIconFallback from '../components/ui/SocialIconFallback';
import OptimizedImage from '../components/ui/OptimizedImage.jsx';
import { ArrowUpRight, CalendarDays, Globe2, HeartHandshake, Layers3, Instagram, Linkedin, Mail, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import links from '../data/links.json';
import { useLocale } from '../i18n/LocaleContext';
import Logo from '../components/ui/Logo';
import Seo from '../components/ui/Seo';
import LanguageToggle from '../components/ui/LanguageToggle';
import ThemeToggle from '../components/ui/ThemeToggle';
import './LinksPage.css';

const socialImages = {
    Instagram: '/assets/socials-logos/instagram-app-icon.png',
    LinkedIn: '/assets/socials-logos/LinkedIn-app-icon.png',
    Luma: '/assets/socials-logos/luma-app-icon.svg',
};

const icons = { join: HeartHandshake, calendar: CalendarDays, projects: Layers3, globe: Globe2, instagram: Instagram, linkedin: Linkedin, mail: Mail, newspaper: Newspaper };
function Destination({ href, children, ...props }) {
    return href.startsWith('/') ? <Link to={href} {...props}>{children}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
}

export default function LinksPage() {
    const { locale, t } = useLocale();
    const copy = (value) => value[locale] || value.en;
    return (
        <div className="club-links">
            <Seo />
            <div className="club-links-backdrop" aria-hidden="true"><OptimizedImage src={links.image} alt="" fetchPriority="high" /></div>
            <div className="club-links-language"><LanguageToggle /></div>
            <div className="club-links-tools"><ThemeToggle /></div>
            <div className="club-links-content">
                <header className="club-links-header">
                    <Link to="/" aria-label="CGN Social AI Club"><Logo navbarSingleLine fullWidth className="club-links-logo" /></Link>
                    <h1 className="sr-only">CGN Social AI Club — {locale === 'de' ? 'Alle Links' : 'All links'}</h1>
                    <p>{t.home.heroDescription}</p>
                </header>
                <nav className="club-links-list" aria-label={locale === 'de' ? 'Club-Links' : 'Club links'}>
                    {[...links.links.filter((item) => !['contact', 'newsletter'].includes(item.id)), ...links.socials.map((item) => ({
                        ...item,
                        id: item.label.toLowerCase(),
                        href: item.label === 'Email' ? 'mailto:contact@cologne-socialaiclub.de' : item.href,
                        title: { en: item.label, de: item.label === 'Email' ? 'E-Mail' : item.label },
                        description: {
                            en: ({ Instagram: 'Life at CGN Social AI Club', LinkedIn: 'News from our club & projects', Luma: 'Our event calendar', Email: 'contact@cologne-socialaiclub.de' })[item.label],
                            de: ({ Instagram: 'Einblicke in unser Clubleben', LinkedIn: 'Neuigkeiten aus Club & Projekten', Luma: 'Unser Eventkalender', Email: 'contact@cologne-socialaiclub.de' })[item.label],
                        },
                    })), ...links.links.filter((item) => item.id === 'newsletter'), ...links.links.filter((item) => item.id === 'contact')].filter((item) => item.enabled !== false).sort((a, b) => {
                        const order = ['website', 'apply', 'linkedin', 'events', 'instagram', 'newsletter', 'contact'];
                        const rank = (item) => order.includes(item.id) ? order.indexOf(item.id) : order.length;
                        return rank(a) - rank(b);
                    }).map((item, index) => {
                        const Icon = icons[item.icon] || Globe2;
                        return <Destination key={item.id} href={item.href} className={`club-links-item ${item.featured ? 'is-featured application-start-pulse' : 'ui-button-secondary'}`} style={{ '--order': index }}>
                            <span className={`club-links-icon-box ${item.id === 'contact' ? 'is-contact-icon' : ''} collaboration-icon collaboration-icon--${({ website: 'blue', apply: 'green', events: 'purple', contact: 'amber', newsletter: 'purple' })[item.id] || 'blue'}`} aria-hidden="true">
                                {socialImages[item.label] ? <OptimizedImage className="club-links-brand-icon" src={socialImages[item.label]} fallback={<SocialIconFallback service={item.label.toLowerCase()} />} alt="" width="40" height="40" /> : <Icon size={24} strokeWidth={1.8} />}
                            </span>
                            <span><strong>{copy(item.title)}</strong><small>{copy(item.description)}</small></span>
                            <span className="club-links-action" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.7} /></span>
                        </Destination>;
                    })}
                </nav>

                <footer className="club-links-footer"><span>© {new Date().getFullYear()} CGN Social AI Club e.V.</span><div><Link to="/imprint">{locale === 'de' ? 'Impressum' : 'Imprint'}</Link><Link to="/privacy">{locale === 'de' ? 'Datenschutz' : 'Privacy'}</Link></div></footer>
            </div>
        </div>
    );
}

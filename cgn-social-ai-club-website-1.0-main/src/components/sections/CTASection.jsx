import Container from '../ui/Container';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';

export default function CTASection({ variant = 'general', heading, text, buttons, children }) {
    const { t } = useLocale();
    const variants = {
        general: {
            heading: t.cta.general.heading,
            text: t.cta.general.text,
            buttons: [
                { label: t.cta.general.buttons[0], href: '/social-partners', variant: 'primary' },
                { label: t.cta.general.buttons[1], href: '/sponsors', variant: 'primary' },
            ],
        },
        students: {
            heading: t.cta.students.heading,
            text: t.cta.students.text,
            buttons: [
                { label: t.cta.students.buttons[0], href: '/application', variant: 'gradient' },
                { label: t.cta.students.buttons[1], href: '/team', variant: 'secondary' },
            ],
        },
        members: {
            heading: t.cta.members.heading,
            text: t.cta.members.text,
            buttons: [
                { label: t.cta.members.buttons[0], href: '/application', variant: 'gradient' },
            ],
        },
        socialPartners: {
            heading: t.cta.socialPartners.heading,
            text: t.cta.socialPartners.text,
            buttons: [
                { label: t.cta.socialPartners.buttons[0], href: '/contact', variant: 'primary' },
                { label: t.cta.socialPartners.buttons[1], href: '/projects', variant: 'tertiary' },
            ],
        },
        sponsors: {
            heading: t.cta.sponsors.heading,
            text: t.cta.sponsors.text,
            buttons: [
                { label: t.cta.sponsors.buttons[0], href: '/contact', variant: 'primary' },
            ],
        },
    };

    const content = variant ? (variants[variant] || variants.general) : {};
    const finalHeading = heading || content.heading;
    const finalText = text || content.text;
    const finalButtons = buttons || content.buttons;

    return (
        <section className="cta-section w-full">
            <Container>
                {children}
                <div className="text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-primary font-heading cta-heading">
                        {finalHeading}
                    </h2>
                    <p className="text-xl text-secondary max-w-2xl mx-auto cta-copy">
                        {finalText}
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4">
                        {finalButtons && finalButtons.map((btn, i) => (
                            <Button
                                key={i}
                                variant={i === 1 ? 'tertiary' : btn.variant}
                                href={btn.href}
                                target={btn.target}
                                rel={btn.target === '_blank' ? 'noopener noreferrer' : btn.rel}
                                className={i === 1
                                    ? 'sm:w-auto border-[var(--hero-border)] [--border-default:var(--hero-border)] [--active-overlay:var(--hero-hover)] hover:backdrop-blur-sm active:backdrop-blur-sm'
                                    : 'sm:w-auto'}
                            >
                                {btn.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}

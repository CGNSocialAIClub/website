import React from 'react';
import Container from '../components/ui/Container';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function Imprint() {
    const { locale } = useLocale();
    const isGerman = locale === 'de';

    return (
        <Container className="py-20">
            <Seo title={isGerman ? 'Impressum' : 'Legal Notice'} description={isGerman ? 'Rechtliche Angaben zum CGN Social AI Club e.V.' : 'Legal information for CGN Social AI Club e.V.'} />
            <h1 className="text-4xl font-bold mb-8 font-heading text-[var(--text-primary)]">{isGerman ? 'Impressum' : 'Legal Notice'}</h1>
            <div className="prose prose-blue dark:prose-invert max-w-none text-[var(--text-secondary)]">
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Angaben gemäß § 5 TMG' : 'Information pursuant to Section 5 TMG'}</h2>
                    <p>
                        CGN Social AI Club e.V.<br />
                        c/o Studentische Vertretung<br />
                        Arcisstraße 21<br />
                        50667 Köln<br />
                        Deutschland
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Vertreten durch den Vorstand im Sinne des § 26 BGB' : 'Represented by the executive board pursuant to Section 26 BGB'}</h2>
                    <p>
                        Jaron Schurer<br />
                        Nicolas Paul<br />
                        Leon Körbs
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Kontakt' : 'Contact'}</h2>
                    <p>
                        E-Mail: <a href="mailto:contact@cgn-socialaiclub.de" className="font-semibold text-[var(--text-primary)]">contact@cgn-socialaiclub.de</a><br />
                        Webseite: <a href="https://cgn-socialaiclub.de" className="font-semibold text-[var(--text-primary)]">www.cgn-socialaiclub.de</a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Registereintrag' : 'Register Entry'}</h2>
                    <p>
                        {isGerman ? 'Eintragung im Vereinsregister.' : 'Registered in the association register.'}<br />
                        {isGerman ? 'Registernummer' : 'Registration number'}: VR 211270<br />
                        {isGerman ? 'Registergericht' : 'Register court'}: Amtsgericht Köln
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Umsatzsteuer-Identifikationsnummer' : 'VAT Identification Number'}</h2>
                    <p>{isGerman ? 'Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG' : 'VAT identification number pursuant to Section 27a UStG'}: DE459795933</p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV' : 'Responsible for content pursuant to Section 18 para. 2 MStV'}</h2>
                    <p>
                        Jaron Schurer<br />
                        c/o Studentische Vertretung<br />
                        Arcisstraße 21<br />
                        50667 Köln<br />
                        Deutschland
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? 'Hinweis zur Streitbeilegung' : 'Dispute Resolution Notice'}</h2>
                    <p>
                        {isGerman
                            ? 'Der Verein ist nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                            : 'The association is neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.'}
                    </p>
                </section>
            </div>
        </Container>
    );
}

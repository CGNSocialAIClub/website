import React from 'react';
import Container from '../components/ui/Container';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function Imprint() {
    const { locale } = useLocale();
    const isGerman = locale === 'de';

    return (
        <Container className="py-20">
            <Seo
                title={isGerman ? 'Impressum' : 'Legal Notice'}
                description={
                    isGerman
                        ? 'Rechtliche Angaben zum CGN Social AI Club i.G.'
                        : 'Legal information for CGN Social AI Club (association in formation).'
                }
            />

            <h1 className="text-4xl font-bold mb-8 font-heading text-[var(--text-primary)]">
                {isGerman ? 'Impressum' : 'Legal Notice'}
            </h1>

            <div className="prose prose-blue dark:prose-invert max-w-none text-[var(--text-secondary)]">

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman ? 'Angaben gemäß § 5 DDG' : 'Information pursuant to Section 5 DDG'}
                    </h2>

                    <p>
                        CGN Social AI Club i.G.<br />
                        Johannes Müller <br />
                        Zülpicher Wall 28<br />
                        50674 Köln<br />
                        Deutschland
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman
                            ? 'Vertreten durch den Gründungsvorstand'
                            : 'Represented by the founding executive board'}
                    </h2>

                    <p>
                        Johannes Müller<br />
                        Tim Wortmann<br />
                        André Schmidt
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman ? 'Kontakt' : 'Contact'}
                    </h2>

                    <p>
                        E-Mail:{' '}
                        <a
                            href="mailto:cgn.socialaiclub@gmail.com"
                            className="font-semibold text-[var(--text-primary)]"
                        >
                            cgn.socialaiclub@gmail.com
                        </a>
                        <br />
                        Webseite:{' '}
                        <a
                            href="https://cologne-socialaiclub.de"
                            className="font-semibold text-[var(--text-primary)]"
                        >
                            www.cologne-socialaiclub.de
                        </a>
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman ? 'Registereintrag' : 'Register Entry'}
                    </h2>

                    <p>
                        {isGerman
                            ? 'Der Verein befindet sich in Gründung und ist derzeit noch nicht im Vereinsregister eingetragen.'
                            : 'The association is currently in formation and has not yet been registered in the German Register of Associations.'}
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman
                            ? 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV'
                            : 'Responsible for content pursuant to Section 18 para. 2 MStV'}
                    </h2>

                    <p>
                        André Schmidt<br />
                        Pfarrhelle 5<br />
                        66440 Blieskastel<br />
                        Deutschland
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">
                        {isGerman ? 'Hinweis zur Streitbeilegung' : 'Dispute Resolution Notice'}
                    </h2>

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
import React from 'react';
import Container from '../components/ui/Container';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

export default function PrivacyPolicy() {
    const { locale } = useLocale();
    const isGerman = locale === 'de';

    return (
        <Container className="py-20">
            <Seo title={isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'} description={isGerman ? 'Informationen zur Verarbeitung personenbezogener Daten auf dieser Website.' : 'Information on the processing of personal data on this website.'} />
            <h1 className="text-4xl font-bold mb-8 font-heading text-[var(--text-primary)]">{isGerman ? 'Datenschutzerklärung' : 'Privacy Policy'}</h1>
            <div className="prose prose-blue dark:prose-invert max-w-none text-[var(--text-secondary)] space-y-8">
                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '1. Datenschutz auf einen Blick' : '1. Data Protection at a Glance'}</h2>
                    <h3 className="text-xl font-medium mt-4 mb-2 text-[var(--text-primary)]">{isGerman ? 'Allgemeine Hinweise' : 'General Information'}</h3>
                    <p>
                        {isGerman
                            ? 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.'
                            : 'The following information provides a simple overview of what happens to your personal data when you visit this website. Personal data is any data by which you can be personally identified.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '2. Datenerfassung auf unserer Website' : '2. Data Collection on Our Website'}</h2>
                    <h3 className="text-xl font-medium mt-4 mb-2 text-[var(--text-primary)]">{isGerman ? 'Wer ist verantwortlich für die Datenerfassung auf dieser Website?' : 'Who is responsible for data collection on this website?'}</h3>
                    <p>
                        {isGerman
                            ? 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.'
                            : 'Data processing on this website is carried out by the website operator. You can find the operator’s contact details in the legal notice of this website.'}
                    </p>
                    <h3 className="text-xl font-medium mt-4 mb-2 text-[var(--text-primary)]">{isGerman ? 'Wie erfassen wir Ihre Daten?' : 'How do we collect your data?'}</h3>
                    <p>
                        {isGerman
                            ? 'Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen, insbesondere im Rahmen der Kontaktaufnahme per E-Mail oder Kontaktformular.'
                            : 'Your data is collected, on the one hand, when you provide it to us, in particular when contacting us by email or via the contact form.'}
                    </p>
                    <p>
                        {isGerman
                            ? 'Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt automatisch, sobald Sie unsere Website betreten.'
                            : 'Other data is collected automatically by our IT systems when you visit the website. This primarily includes technical data such as your browser, operating system, or time of access. This data is collected automatically as soon as you enter the website.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '3. Hosting über Cloudflare' : '3. Hosting via Cloudflare'}</h2>
                    <p>
                        Diese Website wird über Cloudflare (Cloudflare, Inc.) bereitgestellt. Cloudflare fungiert als Content-Delivery- und Sicherheitsdienst und verarbeitet dabei technische Zugriffsdaten (z. B. IP-Adresse, Zeitpunkt des Zugriffs, Browser-/Geräteinformationen), um die Website auszuliefern und zu schützen.
                    </p>
                    <p>
                        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und effizienten Bereitstellung der Website). Eine Verarbeitung in Drittländern ist möglich; Cloudflare setzt hierfür Standardvertragsklauseln ein.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '4. Server-Logfiles' : '4. Server Log Files'}</h2>
                    <p>
                        Der Hosting- und Sicherheitsanbieter dieser Website erhebt und speichert automatisch Informationen in sogenannten Server-Logfiles, die Ihr Browser automatisch an uns übermittelt. Dies sind insbesondere Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
                    </p>
                    <p>
                        Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO zur Sicherstellung der Stabilität und Sicherheit der Website.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '5. Kontakt per E-Mail und Kontaktformular' : '5. Contact by Email and Contact Form'}</h2>
                    <p>
                        {isGerman
                            ? 'Wenn Sie uns per E-Mail oder über das Kontaktformular auf dieser Website kontaktieren, werden Ihre Angaben inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen verarbeitet.'
                            : 'If you contact us by email or via the contact form on this website, the data you provide, including your contact details, will be processed for the purpose of handling your request and possible follow-up questions.'}
                    </p>
                    <p>
                        {isGerman
                            ? 'Bei der Nutzung des Kontaktformulars werden insbesondere Name, E-Mail-Adresse, Hintergrund, Betreff, Nachricht sowie technische Metadaten der Anfrage verarbeitet. Die Verarbeitung erfolgt je nach Anfrage auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche bzw. vertragliche Kommunikation) oder Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der effizienten Bearbeitung von Anfragen).'
                            : 'When using the contact form, in particular your name, email address, background, subject, message and technical request metadata are processed. Processing takes place, depending on the request, on the basis of Art. 6 para. 1 lit. b GDPR or Art. 6 para. 1 lit. f GDPR.'}
                    </p>
                    <p>
                        {isGerman
                            ? 'Für die technische Bereitstellung und Übermittlung der Formularanfragen nutzen wir den Dienst Formspree der Formspree, Inc. Dabei werden die von Ihnen im Formular eingegebenen Daten an Formspree übermittelt und dort in unserem Auftrag verarbeitet, um die Anfrage zuverlässig entgegenzunehmen, Spam zu filtern und an uns weiterzuleiten.'
                            : 'We use the service Formspree by Formspree, Inc. for the technical provision and transmission of contact form requests. The data entered into the form is transmitted to Formspree and processed there on our behalf to receive the request reliably, filter spam and forward it to us.'}
                    </p>
                    <p>
                        {isGerman
                            ? 'Eine Verarbeitung in Drittländern, insbesondere in den USA, kann dabei nicht ausgeschlossen werden. Nach den Angaben von Formspree stützt sich der Anbieter bei internationalen Datenübermittlungen auf Standardvertragsklauseln (SCCs).'
                            : 'Processing in third countries, in particular in the United States, cannot be ruled out. According to Formspree, the provider relies on Standard Contractual Clauses (SCCs) for international data transfers.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '6. Analytics' : '6. Analytics'}</h2>
                    <p>
                        {isGerman
                            ? 'Aktuell verwenden wir keine Analyse- oder Tracking-Tools zur Auswertung des Nutzerverhaltens auf dieser Website.'
                            : 'We currently do not use analytics or tracking tools to evaluate user behavior on this website.'}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">{isGerman ? '7. Ihre Rechte' : '7. Your Rights'}</h2>
                    <p>
                        {isGerman
                            ? 'Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.'
                            : 'You have the right at any time to obtain information free of charge about the origin, recipients and purpose of your stored personal data. You also have the right to request the correction or deletion of this data.'}
                    </p>
                </section>
            </div>
        </Container>
    );
}

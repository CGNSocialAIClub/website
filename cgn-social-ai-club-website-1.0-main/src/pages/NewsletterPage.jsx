import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import CTASection from '../components/sections/CTASection';
import Seo from '../components/ui/Seo';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import Button from '../components/ui/Button';
import SocialsSection from '../components/sections/SocialsSection';
import { Check, Mail } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { readNewsletterResponse, requestNewsletterConfirmation } from '../utils/newsletterResponse.mjs';

const copy = {
  en: {
    eyebrow: 'CGN SOCIAL AI CLUB', title: 'Stay in the loop.',
    description: 'Get occasional updates on events, opportunities and what our community is up to.',
    firstName: 'First name', lastName: 'Last name', email: 'Email address', consent: 'I agree to receive occasional email updates from CGN Social AI Club. I can unsubscribe at any time.',
    submit: 'Subscribe', privacy: 'We’ll only use your details for club updates. Your subscription starts after you confirm your email address.', privacyLink: 'Read our privacy policy',
    sending: 'Sending confirmation…', sent: 'If this address can receive mail, a confirmation link will arrive shortly. Check your spam folder.', confirm: 'Confirm your subscription', confirmBody: 'Confirm that you want to receive occasional updates from CGN Social AI Club.',
    unsubscribe: 'Unsubscribe from updates?', unsubscribeBody: 'Confirm that you want to stop receiving email updates from CGN Social AI Club.',
    success: 'Your preference has been updated.', subscribed: 'You’re subscribed. Thanks for confirming your email address.',
    unavailable: 'The newsletter service is temporarily unavailable. Please try again later.', localUnavailable: 'This local preview cannot reach the newsletter service. Use the public website to subscribe.', publicSignup: 'Open newsletter website',
    invalid: 'This link has expired or is invalid. Please try again or contact the club team.', actionConfirm: 'Confirm subscription', actionUnsubscribe: 'Unsubscribe', wait: 'Please wait…',
  },
  de: {
    eyebrow: 'CGN SOCIAL AI CLUB', title: 'Bleib auf dem Laufenden.',
    description: 'Erhalte gelegentliche Updates zu Events, Möglichkeiten und unserer Community.',
    firstName: 'Vorname', lastName: 'Nachname', email: 'E-Mail-Adresse', consent: 'Ich möchte gelegentliche E-Mail-Updates vom CGN Social AI Club erhalten. Ich kann mich jederzeit abmelden.',
    submit: 'Anmelden', privacy: 'Wir verwenden deine Angaben nur für Updates des Clubs. Dein Abonnement beginnt erst nach der Bestätigung deiner E-Mail-Adresse.', privacyLink: 'Datenschutzerklärung lesen',
    sending: 'Bestätigungslink wird gesendet …', sent: 'Wenn diese Adresse E-Mails empfangen kann, kommt gleich ein Bestätigungslink. Schau auch in deinen Spam-Ordner.', confirm: 'Anmeldung bestätigen', confirmBody: 'Bestätige, dass du gelegentliche Updates vom CGN Social AI Club erhalten möchtest.',
    unsubscribe: 'Von Updates abmelden?', unsubscribeBody: 'Bestätige, dass du keine E-Mail-Updates mehr vom CGN Social AI Club erhalten möchtest.',
    success: 'Deine E-Mail-Einstellung wurde aktualisiert.', subscribed: 'Du bist angemeldet. Danke, dass du deine E-Mail-Adresse bestätigt hast.',
    unavailable: 'Der Newsletter-Dienst ist gerade nicht erreichbar. Bitte versuche es später erneut.', localUnavailable: 'Diese lokale Vorschau erreicht den Newsletter-Dienst nicht. Bitte nutze die öffentliche Website zur Anmeldung.', publicSignup: 'Newsletter-Website öffnen',
    invalid: 'Dieser Link ist abgelaufen oder ungültig. Bitte melde dich erneut an oder kontaktiere das Club-Team.', actionConfirm: 'Anmeldung bestätigen', actionUnsubscribe: 'Abmelden', wait: 'Einen Moment …',
  },
};

function PageFrame({ title, subtitle, children }) {
  const {locale}=useLocale();
  return <>
    <Seo title={title} description="Manage email updates from CGN Social AI Club." noIndex />
    <div className="pb-20">
      <Container className="flex flex-col items-center">
        <HeadingSection as="h1" badge="Newsletter" title={title} subtitle={subtitle} />
        {children}
      </Container>
    </div>
    <SocialsSection />
    <CTASection heading={locale==='de'?'Mehr vom Club entdecken.':'Discover more of the club.'} text={locale==='de'?'Unsere Projekte und Events zeigen, woran wir arbeiten.':'Explore our projects and the events that bring us together.'} buttons={[
      {label:locale==='de'?'Projekte entdecken':'Explore Projects',href:'/projects',variant:'secondary'},
      {label:locale==='de'?'Events ansehen':'Explore Events',href:'/events',variant:'tertiary'},
    ]}/>
  </>;
}

const fieldClassName = 'w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]';
const formCardClassName = 'w-full max-w-xl rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6 shadow-xl';

function SuccessMessage({ title, children, pending = false }) {
  const Icon = pending ? Mail : Check;
  return <div role="status" className="flex w-full max-w-xl flex-col items-center rounded-[2rem] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-10 text-center shadow-xl">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#4BFFC0] text-[#0a2d57] shadow-[0_0_24px_rgba(75,255,192,0.22)]"><Icon className="h-8 w-8" /></div>
    <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)] leading-heading">{title}</h2>
    <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p>
  </div>;
}

export default function NewsletterPage() {
  const { locale } = useLocale();
  const t = copy[locale === 'de' ? 'de' : 'en'];
  const { action, token } = useParams();
  const location = useLocation();
  const mode = action === 'confirm' ? 'confirm' : action === 'unsubscribe' || location.pathname.startsWith('/unsubscribe/') ? 'unsubscribe' : 'signup';
  const [state, setState] = useState('idle');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isLocalPreview = typeof window !== 'undefined' && ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const unavailableMessage = isLocalPreview ? t.localUnavailable : t.unavailable;

  // Forms can shrink into a status card. Reset before paint so the result
  // never inherits a scroll position near the footer (including on mobile).
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname, state, busy]);

  useEffect(() => {
    setState('idle'); setMessage(''); setBusy(false);
    if (mode !== 'confirm' || !token) return;
    let active = true;
    setBusy(true);
    requestNewsletterConfirmation(token, unavailableMessage).then(() => {
      if (active) { setState('success'); setMessage(t.subscribed); }
    }).catch(error => {
      if (active) {
        setState('error');
        setMessage(error instanceof TypeError ? unavailableMessage : error.message || unavailableMessage);
      }
    }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [mode, token, unavailableMessage, t.subscribed]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (mode === 'signup' && !form.reportValidity()) return;
    setBusy(true);
    try {
      const endpoint = mode === 'signup' ? '/api/newsletter/subscribe' : `/api/newsletter/${mode}`;
      const payload = mode === 'signup'
        ? Object.fromEntries(new FormData(form))
        : { token };
      if (mode === 'signup') payload.consent = form.elements.consent.checked;
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      });
      await readNewsletterResponse(response, unavailableMessage);
      setState('success'); setMessage(mode === 'signup' ? t.sent : mode === 'unsubscribe' ? t.success : t.subscribed);
      if (mode === 'signup') form.reset();
    } catch (error) {
      setState('error'); setMessage(error instanceof TypeError ? unavailableMessage : error.message || unavailableMessage);
    } finally { setBusy(false); }
  }

  if (mode !== 'signup' && !token) return <PageFrame title="Newsletter" subtitle={t.invalid} />;
  if (mode !== 'signup') {
    const isConfirm = mode === 'confirm';
    if (isConfirm) return <PageFrame title={state === 'success' ? (locale === 'de' ? 'Alles erledigt.' : 'All done.') : t.confirm}>
      {state === 'success' ? <SuccessMessage title={locale === 'de' ? 'Anmeldung bestätigt' : 'Subscription confirmed'}>{message}</SuccessMessage> :
        <div className={`${formCardClassName} space-y-4 text-center`}>
          {state === 'error' ? <><p role="alert" className="text-sm text-red-500">{message}</p><a href="/newsletter" className="text-sm text-[var(--text-primary)] underline underline-offset-4">{locale === 'de' ? 'Neuen Bestätigungslink anfordern' : 'Request a new confirmation link'}</a></> : <p role="status" className="text-[var(--text-secondary)]">{t.wait}</p>}
        </div>}
    </PageFrame>;
    return <PageFrame title={t.unsubscribe} subtitle={t.unsubscribeBody}>
      {state === 'success' ? <SuccessMessage title={locale === 'de' ? 'Alles erledigt.' : 'All done.'}>{message}</SuccessMessage> :
        <form className={formCardClassName} onSubmit={submit}>
          {state === 'error' ? <p role="alert" className="text-sm text-red-500">{message}</p> :
            <Button type="submit" variant="primary" className="w-full justify-center py-4 text-base disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? t.wait : isConfirm ? t.actionConfirm : t.actionUnsubscribe}</Button>}
        </form>}
    </PageFrame>;
  }

  return <PageFrame title={t.title} subtitle={t.description}>
    {state === 'success' ? <SuccessMessage pending title={locale === 'de' ? 'Schau in dein Postfach.' : 'Check your inbox.'}>{message}</SuccessMessage> :
    <form className={`${formCardClassName} space-y-6 text-left`} onSubmit={submit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3"><label htmlFor="newsletter-first-name" className="text-base font-semibold text-secondary ml-1">{t.firstName}</label><input id="newsletter-first-name" name="firstName" required maxLength={100} autoComplete="given-name" className={fieldClassName} placeholder={locale === 'de' ? 'Dein Vorname' : 'Your first name'} /></div>
        <div className="flex flex-col gap-3"><label htmlFor="newsletter-last-name" className="text-base font-semibold text-secondary ml-1">{t.lastName}</label><input id="newsletter-last-name" name="lastName" required maxLength={100} autoComplete="family-name" className={fieldClassName} placeholder={locale === 'de' ? 'Dein Nachname' : 'Your last name'} /></div>
        <div className="flex flex-col gap-3 md:col-span-2"><label htmlFor="newsletter-email" className="text-base font-semibold text-secondary ml-1">{t.email}</label><input id="newsletter-email" name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClassName} placeholder="you@example.com" /></div>
      </div>
      <label className="flex items-start gap-3 px-3 text-sm leading-6 text-[var(--text-secondary)]"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#0a2d57]" /><span>{t.consent}</span></label>
      <div className="absolute left-[-10000px]" aria-hidden="true"><label htmlFor="newsletter-company">Company</label><input id="newsletter-company" name="company" tabIndex={-1} autoComplete="off" /></div>
      <div className="pt-2 flex gap-3"><Button type="submit" variant="primary" className="flex-1 justify-center py-4 text-base disabled:cursor-wait disabled:opacity-60" disabled={busy}>{busy ? t.sending : t.submit}</Button></div>
      {state === 'error' && <div role="alert" className="space-y-3"><p className="text-sm text-red-500">{message}</p>{isLocalPreview && <a href="https://cologne-socialaiclub.de/newsletter" className="text-sm underline underline-offset-4">{t.publicSignup}</a>}</div>}
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{t.privacy} <a href="/privacy" className="font-medium text-[var(--text-primary)] hover:text-[var(--text-accent)] underline underline-offset-4 transition-colors">{t.privacyLink}</a></p>
    </form>}
  </PageFrame>;
}

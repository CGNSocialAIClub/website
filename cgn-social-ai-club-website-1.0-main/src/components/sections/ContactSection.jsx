import { useState } from 'react';
import Button from '../ui/Button';
import { Check, ChevronDown } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleContext';


export default function ContactSection() {
    const { t } = useLocale();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        background: '',
        subject: '',
        message: '',
        _gotcha: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (submitError) {
            setSubmitError('');
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');

        try {
            const response = await fetch('https://formspree.io/f/xanzpnye', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    form_name: 'contact_form',
                    _subject: 'Website Contact',
                    ...formData
                })
            });

            if (!response.ok) {
                throw new Error(t.contactForm.submitError);
            }

            setIsSuccess(true);
            setFormData({
                name: '',
                email: '',
                background: '',
                subject: '',
                message: '',
                _gotcha: ''
            });
        } catch (error) {
            setSubmitError(error.message || t.contactForm.submitError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className={`bg-[var(--bg-surface)] border overflow-hidden transition-all duration-500 ease-out ${
                isSuccess
                    ? 'w-full max-w-[17rem] min-h-[17rem] rounded-3xl border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm'
                    : 'w-full max-w-xl rounded-[2rem] border-[var(--border-default)] shadow-xl'
            }`}
        >
            {isSuccess ? (
                <div className="flex min-h-[17rem] flex-col items-center justify-center px-6 py-8 text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#4BFFC0] text-white shadow-[0_0_24px_rgba(75,255,192,0.22)]">
                        <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                    <h3 className="text-2xl font-bold font-heading text-[var(--text-primary)]">
                        {t.contactForm.successTitle}
                    </h3>
                    <p className="mt-2 max-w-[14rem] text-sm text-[var(--text-secondary)]">
                        {t.contactForm.successText}
                    </p>
                </div>
            ) : (
                <div className="p-5 md:p-6 text-left">
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <input type="hidden" name="form_name" value="contact_form" />
                <input type="hidden" name="_subject" value="Website Contact" />
                <input
                    type="text"
                    name="_gotcha"
                    value={formData._gotcha}
                    onChange={handleChange}
                    autoComplete="off"
                    tabIndex={-1}
                    className="hidden"
                    aria-hidden="true"
                />

                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3 md:basis-2/5 md:flex-shrink-0 md:flex-grow-0">
                        <label htmlFor="name" className="text-base font-semibold text-secondary ml-1">
                            {t.contactForm.name}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            autoComplete="name"
                            placeholder={t.contactForm.namePlaceholder}
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                        />
                    </div>
                    <div className="flex flex-col gap-3 md:basis-3/5 md:flex-shrink-0 md:flex-grow-0">
                        <label htmlFor="email" className="text-base font-semibold text-secondary ml-1">
                            {t.contactForm.email}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            placeholder={t.contactForm.emailPlaceholder}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                        />
                    </div>
                </div>

                {/* Row 2: Background */}
                <div className="flex flex-col gap-3">
                    <label htmlFor="background" className="text-base font-semibold text-secondary ml-1">
                        {t.contactForm.background}
                    </label>
                    <div className="relative">
                        <select
                            id="background"
                            name="background"
                            value={formData.background}
                            onChange={handleChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all font-body text-base leading-[1.2] appearance-none cursor-pointer ${formData.background ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}
                        >
                            <option value="" disabled>{t.contactForm.backgroundPlaceholder}</option>
                            {t.contactForm.backgrounds.map((option, index) => (
                                <option key={option} value={index === 0 ? 'Student' : index === 1 ? 'Social Organization' : index === 2 ? 'NGO' : index === 3 ? 'Non-Profit' : index === 4 ? 'Corporate' : index === 5 ? 'Startup' : index === 6 ? 'Academic' : 'Other'}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Row 3: Subject */}
                <div className="flex flex-col gap-3">
                    <label htmlFor="subject" className="text-base font-semibold text-secondary ml-1">
                        {t.contactForm.subject}
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder={t.contactForm.subjectPlaceholder}
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)]"
                    />
                </div>

                {/* Row 4: Message */}
                <div className="flex flex-col gap-3">
                    <label htmlFor="message" className="text-base font-semibold text-secondary ml-1">
                        {t.contactForm.message}
                    </label>
                    <div className="relative">
                        <textarea
                            id="message"
                            name="message"
                            placeholder={t.contactForm.messagePlaceholder}
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 pb-8 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] focus:bg-[var(--bg-surface)] focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]/20 outline-none transition-all placeholder:text-[var(--text-tertiary)] text-[var(--text-primary)] resize-y"
                        />
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1 justify-center py-4 text-base"
                        disabled={submitting}
                    >
                        {submitting ? t.contactForm.sending : t.contactForm.submitButton}
                    </Button>
                </div>

                {submitError && (
                    <p className="text-sm text-red-500">
                        {submitError}
                    </p>
                )}

            </form>
                </div>
            )}
        </div>

    );
}

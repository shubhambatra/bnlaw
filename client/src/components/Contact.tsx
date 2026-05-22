import { useState, type FormEvent, type ChangeEvent } from 'react';
import content from '../content.json';

const { contact, site } = content;

const CONTACT_VALUES: Record<string, string> = {
  phone: site.phone,
  email: site.email,
  office: site.address,
  hours: site.hours,
};

const ICONS: Record<string, JSX.Element> = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  office: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  hours: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface FormState { name: string; email: string; phone: string; subject: string; message: string; }
const EMPTY: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const set = (f: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = (e: FormEvent) => { e.preventDefault(); setSubmitted(true); setForm(EMPTY); };

  const { form: f } = contact;

  return (
    <section id="contact" aria-label="Contact" className="py-14 md:py-24 bg-[#0f2167]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-3 sm:mb-4">{contact.eyebrow}</p>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5 sm:mb-6 leading-tight whitespace-pre-line">{contact.heading}</h2>
            <div className="w-12 h-0.5 bg-[#c9a84c] mb-6 sm:mb-8" />
            <p className="text-white/70 leading-relaxed mb-8 sm:mb-10 text-sm">{contact.description}</p>
            <address className="not-italic space-y-5 sm:space-y-6">
              {Object.entries(contact.infoLabels).map(([key, label]) => (
                <div key={key} className="flex gap-3 sm:gap-4">
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c]">
                    {ICONS[key]}
                  </div>
                  <div>
                    <p className="text-[#c9a84c] text-xs tracking-widest uppercase mb-0.5 sm:mb-1">{label}</p>
                    <p className="text-white/80 text-sm whitespace-pre-line">{CONTACT_VALUES[key]}</p>
                  </div>
                </div>
              ))}
            </address>
          </div>

          <div className="bg-white p-5 sm:p-8 lg:p-10">
            {submitted ? (
              <div className="flex h-full min-h-[360px] sm:min-h-[400px] items-center justify-center text-center">
                <div>
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#c9a84c] flex items-center justify-center mx-auto mb-4 sm:mb-5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0f2167] mb-2">{f.success.heading}</h3>
                  <p className="text-gray-500 text-sm">{f.success.message}</p>
                  <button onClick={() => setSubmitted(false)} className="mt-6 sm:mt-8 text-[#c9a84c] text-sm underline hover:text-[#a08030] transition-colors">
                    {f.success.cta}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4 sm:space-y-5">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0f2167] mb-4 sm:mb-6">{f.heading}</h3>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  {(['name', 'email'] as const).map((field) => (
                    <div key={field}>
                      <label htmlFor={`c-${field}`} className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1.5 sm:mb-2">{f.fields[field].label}</label>
                      <input id={`c-${field}`} type={field === 'email' ? 'email' : 'text'} required value={form[field]} onChange={set(field)} placeholder={f.fields[field].placeholder} className="w-full border border-gray-200 px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" />
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="c-phone" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1.5 sm:mb-2">{f.fields.phone.label}</label>
                  <input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder={f.fields.phone.placeholder} className="w-full border border-gray-200 px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors" />
                </div>
                <div>
                  <label htmlFor="c-subject" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1.5 sm:mb-2">{f.fields.subject.label}</label>
                  <select id="c-subject" required value={form.subject} onChange={set('subject')} className="w-full border border-gray-200 px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors bg-white">
                    <option value="">{f.fields.subject.placeholder}</option>
                    {f.practiceAreas.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="c-message" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1.5 sm:mb-2">{f.fields.message.label}</label>
                  <textarea id="c-message" required rows={4} value={form.message} onChange={set('message')} placeholder={f.fields.message.placeholder} className="w-full border border-gray-200 px-3 sm:px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors resize-none" />
                </div>
                <button type="submit" className="w-full bg-[#c9a84c] hover:bg-[#a08030] text-[#080f3a] font-bold py-3.5 sm:py-4 text-sm tracking-widest uppercase transition-colors">{f.submit}</button>
                <p className="text-gray-400 text-xs text-center">{f.confidentiality}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

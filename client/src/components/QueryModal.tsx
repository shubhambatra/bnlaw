import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', subject: '', message: '' };

const PRACTICE_AREAS = [
  'Corporate Law',
  'Family Law',
  'Criminal Defense',
  'Civil Litigation',
  'Real Estate Law',
  'Estate Planning',
  'Other',
];

export default function QueryModal({ isOpen, onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (!isOpen) setSubmitted(false);
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const set =
    (field: keyof FormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Connect to POST /api/queries
    setSubmitted(true);
    setForm(EMPTY_FORM);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ask a Query"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0f2167] px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h2 className="font-serif text-xl font-bold text-white">Ask a Query</h2>
            <p className="text-white/55 text-xs mt-0.5">We respond within 24 business hours</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#c9a84c] flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#0f2167] mb-2">Query Received</h3>
              <p className="text-gray-500 text-sm mb-8">We'll be in touch within 24 business hours.</p>
              <button
                onClick={onClose}
                className="bg-[#0f2167] hover:bg-[#080f3a] text-white font-bold px-10 py-3 text-sm tracking-widest uppercase transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-name" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                    Name *
                  </label>
                  <input
                    id="m-name"
                    type="text"
                    required
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="m-phone" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                    Phone
                  </label>
                  <input
                    id="m-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="m-email" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Email *
                </label>
                <input
                  id="m-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="m-subject" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Practice Area *
                </label>
                <select
                  id="m-subject"
                  required
                  value={form.subject}
                  onChange={set('subject')}
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors bg-white"
                >
                  <option value="">Select a practice area</option>
                  {PRACTICE_AREAS.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="m-message" className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Your Query *
                </label>
                <textarea
                  id="m-message"
                  required
                  rows={4}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="Briefly describe your legal matter..."
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#c9a84c] hover:bg-[#a08030] text-[#080f3a] font-bold py-4 text-sm tracking-widest uppercase transition-colors"
              >
                Submit Query
              </button>

              <p className="text-gray-400 text-xs text-center">All communications are strictly confidential.</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

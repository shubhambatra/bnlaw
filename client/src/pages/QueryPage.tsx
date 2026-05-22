import { useState, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CityAutocomplete from '../components/CityAutocomplete';
import content from '../content.json';

const t = content.queryPage;

type CaseType = 'fir' | 'court' | 'general' | '';

interface FormState {
  name: string;
  email: string;
  phone: string;
  caseType: CaseType;
  firNumber: string;
  firCity: string;
  courtCity: string;
  caseNumber: string;
  description: string;
}

interface Errors {
  name?: string;
  email?: string;
  phone?: string;
  caseType?: string;
  firNumber?: string;
  firCity?: string;
  courtCity?: string;
  caseNumber?: string;
  description?: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  caseType: '',
  firNumber: '',
  firCity: '',
  courtCity: '',
  caseNumber: '',
  description: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-().]{7,15}$/;
const FIR_RE   = /^[\w\d/\-]+$/;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim() || f.name.trim().length < 2)
    e.name = t.errors.name;
  if (!f.email.trim())
    e.email = t.errors.email_required;
  else if (!EMAIL_RE.test(f.email.trim()))
    e.email = t.errors.email_invalid;
  if (f.phone && !PHONE_RE.test(f.phone.trim()))
    e.phone = t.errors.phone_invalid;
  if (!f.caseType)
    e.caseType = t.errors.caseType;
  if (f.caseType === 'fir') {
    if (!f.firNumber.trim())
      e.firNumber = t.errors.firNumber_required;
    else if (!FIR_RE.test(f.firNumber.trim()))
      e.firNumber = t.errors.firNumber_invalid;
    if (!f.firCity.trim())
      e.firCity = t.errors.firCity;
  }
  if (f.caseType === 'court') {
    if (!f.courtCity.trim())
      e.courtCity = t.errors.courtCity;
    if (!f.caseNumber.trim())
      e.caseNumber = t.errors.caseNumber;
  }
  if (!f.description.trim())
    e.description = t.errors.description_required;
  else if (f.description.trim().length < 20)
    e.description = t.errors.description_short;
  return e;
}

// ── Small shared primitives ──────────────────────────────────────────────────

interface LabelProps { htmlFor: string; children: ReactNode; required?: boolean }
function FieldLabel({ htmlFor, children, required }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}

interface InputProps {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}
function TextInput({ id, value, onChange, type = 'text', placeholder, error }: InputProps) {
  return (
    <div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-[#c9a84c]'
        }`}
      />
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <ErrorIcon />
          {error}
        </p>
      )}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current shrink-0" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

interface SectionHeadingProps { step: number; title: string; description?: string }
function SectionHeading({ step, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-7 h-7 rounded-full bg-[#0f2167] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
        <h2 className="font-serif text-lg font-bold text-[#0f2167]">{title}</h2>
      </div>
      {description && <p className="text-gray-400 text-xs ml-0 sm:ml-10">{description}</p>}
      <div className="mt-3 ml-0 sm:ml-10 h-px bg-[#c9a84c]/30" />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function QueryPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value as string;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'caseType') {
        next.firNumber  = '';
        next.firCity    = '';
        next.courtCity  = '';
        next.caseNumber = '';
      }
      return next;
    });
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, ...validate({ ...form, [field]: value }) }));
    }
  };

  const blur = (field: keyof FormState) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, ...validate(form) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate(form);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const payload = await res.json() as { errors?: Record<string, string>; error?: string };
      if (payload.errors) {
        setErrors(payload.errors as Errors);
      } else {
        setSubmitError(payload.error ?? t.networkError);
      }
    } catch {
      setSubmitError(t.networkError);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center px-4 pt-20">
        <div className="bg-white shadow-xl p-8 sm:p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#c9a84c] flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0f2167] mb-3">{t.success.heading}</h1>
          <p className="text-gray-500 leading-relaxed mb-2">
            {t.success.thankyou} <strong className="text-[#0f2167]">{form.name || 'valued client'}</strong>.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {t.success.message}{' '}
            <strong>{form.email}</strong> {t.success.within} <strong>{t.success.timeframe}</strong>.
            {' '}{t.success.confidentiality}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setForm(EMPTY); setErrors({}); setTouched({}); setSubmitted(false); }}
              className="border border-[#0f2167] text-[#0f2167] font-bold px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#0f2167] hover:text-white transition-colors"
            >
              {t.success.newQuery}
            </button>
            <Link
              to="/"
              className="bg-[#0f2167] text-white font-bold px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#080f3a] transition-colors text-center"
            >
              {t.success.backHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFIR   = form.caseType === 'fir';
  const isCourt = form.caseType === 'court';
  const { sections: s, caseTypes } = t;

  return (
    <div className="min-h-screen bg-[#f8f7f2]">
      {/* Page header */}
      <header className="relative bg-[#0f2167] pt-20 pb-10 sm:pt-28 sm:pb-14 px-4 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#c9a84c]" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg,#c9a84c 0,#c9a84c 1px,transparent 0,transparent 50%)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
        <div className="max-w-3xl mx-auto relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#c9a84c] text-sm mb-6 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </Link>
          <p className="text-[#c9a84c] text-xs font-semibold tracking-[0.35em] uppercase mb-3">{t.eyebrow}</p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t.heading}
          </h1>
          <div className="w-12 h-0.5 bg-[#c9a84c] mb-4" />
          <p className="text-white/65 text-sm leading-relaxed max-w-xl">
            {t.description.split('*').map((part, i) =>
              i % 2 === 0 ? part : <span key={i} className="text-red-400">*</span>
            )}
          </p>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Legal query submission form"
          className="bg-white shadow-lg"
        >
          {/* ── Section 1: Personal Details ─────────────────────────── */}
          <div className="p-5 sm:p-8 border-b border-gray-100">
            <SectionHeading step={1} title={s.personal.title} description={s.personal.description} />
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="q-name" required>{s.personal.fields.name.label}</FieldLabel>
                <TextInput
                  id="q-name"
                  value={form.name}
                  onChange={set('name')}
                  placeholder={s.personal.fields.name.placeholder}
                  error={touched.name ? errors.name : undefined}
                />
              </div>
              <div>
                <FieldLabel htmlFor="q-email" required>{s.personal.fields.email.label}</FieldLabel>
                <TextInput
                  id="q-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder={s.personal.fields.email.placeholder}
                  error={touched.email ? errors.email : undefined}
                />
              </div>
              <div>
                <FieldLabel htmlFor="q-phone">{s.personal.fields.phone.label}</FieldLabel>
                <TextInput
                  id="q-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder={s.personal.fields.phone.placeholder}
                  error={touched.phone ? errors.phone : undefined}
                />
              </div>
            </div>
          </div>

          {/* ── Section 2: Case Information ──────────────────────────── */}
          <div className="p-5 sm:p-8 border-b border-gray-100">
            <SectionHeading step={2} title={s.case.title} description={s.case.description} />
            <div>
              <FieldLabel htmlFor="q-casetype" required>{s.case.fields.caseType}</FieldLabel>
              <div className="relative">
                <select
                  id="q-casetype"
                  value={form.caseType}
                  onChange={set('caseType')}
                  onBlur={blur('caseType')}
                  aria-invalid={!!errors.caseType}
                  aria-describedby={errors.caseType ? 'q-casetype-err' : undefined}
                  className={`w-full appearance-none border px-4 py-3 text-sm focus:outline-none transition-colors bg-white pr-10 ${
                    touched.caseType && errors.caseType
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#c9a84c]'
                  }`}
                >
                  <option value="">{caseTypes.placeholder}</option>
                  <option value="fir">{caseTypes.fir}</option>
                  <option value="court">{caseTypes.court}</option>
                  <option value="general">{caseTypes.general}</option>
                </select>
                <svg viewBox="0 0 24 24" className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {touched.caseType && errors.caseType && (
                <p id="q-casetype-err" role="alert" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <ErrorIcon />{errors.caseType}
                </p>
              )}
            </div>

            {/* ── FIR Details (conditional) ────────────────────────── */}
            {isFIR && (
              <div className="mt-6 pt-6 border-t border-dashed border-[#c9a84c]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                  <h3 className="text-sm font-bold text-[#0f2167] tracking-wide uppercase">{s.case.fields.fir.heading}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="q-firnumber" required>{s.case.fields.fir.firNumber.label}</FieldLabel>
                    <TextInput
                      id="q-firnumber"
                      value={form.firNumber}
                      onChange={set('firNumber')}
                      placeholder={s.case.fields.fir.firNumber.placeholder}
                      error={touched.firNumber ? errors.firNumber : undefined}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="q-fircity" required>{s.case.fields.fir.firCity.label}</FieldLabel>
                    <CityAutocomplete
                      id="q-fircity"
                      value={form.firCity}
                      onChange={(val) => {
                        setForm((f) => ({ ...f, firCity: val }));
                        if (touched.firCity) setErrors((prev) => ({ ...prev, ...validate({ ...form, firCity: val }) }));
                      }}
                      placeholder={s.case.fields.fir.firCity.placeholder}
                      error={touched.firCity ? errors.firCity : undefined}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Court Details (conditional) ──────────────────────── */}
            {isCourt && (
              <div className="mt-6 pt-6 border-t border-dashed border-[#c9a84c]/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
                  <h3 className="text-sm font-bold text-[#0f2167] tracking-wide uppercase">{s.case.fields.court.heading}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="q-courtcity" required>{s.case.fields.court.courtCity.label}</FieldLabel>
                    <CityAutocomplete
                      id="q-courtcity"
                      value={form.courtCity}
                      onChange={(val) => {
                        setForm((f) => ({ ...f, courtCity: val }));
                        if (touched.courtCity) setErrors((prev) => ({ ...prev, ...validate({ ...form, courtCity: val }) }));
                      }}
                      placeholder={s.case.fields.court.courtCity.placeholder}
                      error={touched.courtCity ? errors.courtCity : undefined}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="q-casenumber" required>{s.case.fields.court.caseNumber.label}</FieldLabel>
                    <TextInput
                      id="q-casenumber"
                      value={form.caseNumber}
                      onChange={set('caseNumber')}
                      placeholder={s.case.fields.court.caseNumber.placeholder}
                      error={touched.caseNumber ? errors.caseNumber : undefined}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 3: Description ────────────────────────────────── */}
          <div className="p-5 sm:p-8 border-b border-gray-100">
            <SectionHeading step={3} title={s.queryDesc.title} description={s.queryDesc.description} />
            <div>
              <FieldLabel htmlFor="q-desc" required>{s.queryDesc.fields.description.label}</FieldLabel>
              <textarea
                id="q-desc"
                rows={6}
                value={form.description}
                onChange={set('description')}
                onBlur={blur('description')}
                placeholder={s.queryDesc.fields.description.placeholder}
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'q-desc-err' : undefined}
                className={`w-full border px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${
                  touched.description && errors.description
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#c9a84c]'
                }`}
              />
              <div className="flex items-start justify-between mt-1.5">
                <div>
                  {touched.description && errors.description && (
                    <p id="q-desc-err" role="alert" className="text-xs text-red-500 flex items-center gap-1">
                      <ErrorIcon />{errors.description}
                    </p>
                  )}
                </div>
                <p className={`text-xs ml-4 shrink-0 ${form.description.length < 20 ? 'text-gray-400' : 'text-[#c9a84c]'}`}>
                  {form.description.length} / {s.queryDesc.minChars}
                </p>
              </div>
            </div>
          </div>

          {/* ── Submit ───────────────────────────────────────────────── */}
          <div className="p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <button
                type="submit"
                disabled={loading}
                className="relative bg-[#c9a84c] hover:bg-[#a08030] disabled:opacity-70 disabled:cursor-not-allowed text-[#080f3a] font-bold px-10 py-4 text-sm tracking-widest uppercase transition-colors hover:shadow-lg flex items-center gap-3"
              >
                {loading && (
                  <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
                {loading ? t.submitting : t.submit}
              </button>
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {t.confidentiality}
              </div>
            </div>

            {submitError && (
              <div role="alert" className="mt-6 border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-500 shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-red-700 text-sm">{submitError}</p>
              </div>
            )}

            {!submitError && Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
              <div role="alert" className="mt-6 border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-red-500 shrink-0 mt-0.5" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                <p className="text-red-700 text-sm">{t.validationSummary}</p>
              </div>
            )}
          </div>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8 leading-relaxed">
          {content.site.name} is committed to maintaining the highest standards of attorney-client privilege.
          <br className="hidden sm:block" />
          Your information will never be shared with third parties.
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import content from '../content.json';
import { apiUrl } from '../lib/api';

const t = content.admin;
const TOKEN_KEY = 'bnlaw_admin_token';
const TYPES = ['text', 'email', 'phone', 'number', 'dropdown'];

interface Question {
  id: number;
  question_text: string;
  order_index: number;
  type: string;
  options: string | null;
  required: number;
  active: number;
}

const EMPTY_FORM = { question_text: '', type: 'text', order_index: '', options: '', required: true, active: true };

// ── Auth helpers ──────────────────────────────────────────────────────────────

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
function saveToken(tok: string) { sessionStorage.setItem(TOKEN_KEY, tok); }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }
function authHeaders() { return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }; }

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(t.login.error);
        return;
      }
      saveToken(json.token);
      onSuccess();
    } catch {
      setError(t.login.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7f2] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl w-full max-w-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-[#0f2167] flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-8 h-8 fill-[#c9a84c]" aria-hidden="true">
              <path d="M16 2L4 8v3h24V8L16 2zM4 27h24v2H4v-2zM7 13v12H5v2h22v-2h-2V13h-2v12h-4V13h-2v12h-4V13H7z" />
            </svg>
          </div>
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#0f2167] text-center mb-1">{t.login.title}</h1>
        <p className="text-gray-500 text-sm text-center mb-6">{t.login.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-pw" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {t.login.passwordLabel}
            </label>
            <input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.login.passwordPlaceholder}
              required
              className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0f2167] hover:bg-[#080f3a] disabled:opacity-50 text-white font-bold py-3 text-sm tracking-widest uppercase transition-colors"
          >
            {loading ? t.login.submitting : t.login.submit}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main admin panel ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => !!getToken());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/admin/questions'), { headers: authHeaders() });
      if (res.status === 401) { clearToken(); setAuthed(false); return; }
      const json = await res.json();
      setQuestions(json.data ?? []);
    } catch {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  const logout = async () => {
    await fetch(apiUrl('/api/admin/logout'), { method: 'POST', headers: authHeaders() }).catch(() => {});
    clearToken();
    setAuthed(false);
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, order_index: String(questions.length + 1) });
    setShowForm(true);
  };

  const openEdit = (q: Question) => {
    setEditId(q.id);
    setForm({
      question_text: q.question_text,
      type: q.type,
      order_index: String(q.order_index),
      options: q.options ? JSON.parse(q.options).join(', ') : '',
      required: q.required === 1,
      active: q.active === 1,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.question_text.trim()) { setError('Question text is required.'); return; }
    setSaving(true);
    setError('');
    const body = {
      question_text: form.question_text.trim(),
      type: form.type,
      order_index: Number(form.order_index) || undefined,
      options: form.type === 'dropdown' ? form.options.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      required: form.required,
      active: form.active,
    };
    try {
      const url = editId ? apiUrl(`/api/admin/questions/${editId}`) : apiUrl('/api/admin/questions');
      const res = await fetch(url, { method: editId ? 'PATCH' : 'POST', headers: authHeaders(), body: JSON.stringify(body) });
      if (res.status === 401) { clearToken(); setAuthed(false); return; }
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Failed.');
      setShowForm(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.actions.delete_confirm)) return;
    await fetch(apiUrl(`/api/admin/questions/${id}`), { method: 'DELETE', headers: authHeaders() });
    await load();
  };

  const toggleActive = async (q: Question) => {
    await fetch(apiUrl(`/api/admin/questions/${q.id}`), { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ active: q.active === 0 }) });
    await load();
  };

  const move = async (q: Question, dir: -1 | 1) => {
    const newOrder = q.order_index + dir;
    const swap = questions.find((x) => x.order_index === newOrder);
    await fetch(apiUrl(`/api/admin/questions/${q.id}`), { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ order_index: newOrder }) });
    if (swap) await fetch(apiUrl(`/api/admin/questions/${swap.id}`), { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ order_index: q.order_index }) });
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0f2167]">{t.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={openAdd} className="bg-[#c9a84c] hover:bg-[#a08030] text-[#080f3a] font-bold px-5 py-2.5 text-sm tracking-widest uppercase transition-colors">
              {t.addButton}
            </button>
            <button onClick={logout} className="border border-gray-200 text-gray-500 hover:text-[#0f2167] px-4 py-2.5 text-xs uppercase tracking-wider transition-colors">
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded flex items-center justify-between">
            {error}
            <button onClick={() => setError('')} className="underline text-xs">{t.actions.dismiss}</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#0f2167] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {questions.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">{t.empty}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">{t.table.order}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.table.question}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">{t.table.type}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">{t.table.active}</th>
                    <th className="px-4 py-3 w-32" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {questions.map((q, i) => (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-mono">{q.order_index}</td>
                      <td className="px-4 py-3 text-gray-800">{q.question_text}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{q.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(q)} aria-label={q.active === 1 ? t.actions.deactivate : t.actions.activate}
                          className={`w-10 h-5 rounded-full transition-colors relative ${q.active === 1 ? 'bg-[#0f2167]' : 'bg-gray-200'}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${q.active === 1 ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => move(q, -1)} disabled={i === 0} aria-label={t.actions.moveUp} className="p-1 text-gray-400 hover:text-[#0f2167] disabled:opacity-20 transition-colors">↑</button>
                          <button onClick={() => move(q, 1)} disabled={i === questions.length - 1} aria-label={t.actions.moveDown} className="p-1 text-gray-400 hover:text-[#0f2167] disabled:opacity-20 transition-colors">↓</button>
                          <button onClick={() => openEdit(q)} className="p-1 text-gray-400 hover:text-[#0f2167] transition-colors text-xs font-medium">{t.actions.edit}</button>
                          <button onClick={() => handleDelete(q.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors text-xs font-medium">{t.actions.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
            <div className="relative bg-white w-full max-w-md rounded-lg shadow-2xl p-6 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#0f2167]">{editId ? t.form.editTitle : t.form.addTitle}</h2>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.form.fields.questionText}</label>
                <textarea rows={2} value={form.question_text} onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded outline-none focus:border-[#c9a84c] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.form.fields.type}</label>
                  <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 text-sm rounded outline-none focus:border-[#c9a84c] bg-white">
                    {TYPES.map((tp) => <option key={tp}>{tp}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.form.fields.order}</label>
                  <input type="number" value={form.order_index} onChange={(e) => setForm((f) => ({ ...f, order_index: e.target.value }))}
                    className="w-full border border-gray-200 px-3 py-2 text-sm rounded outline-none focus:border-[#c9a84c]" />
                </div>
              </div>
              {form.type === 'dropdown' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{t.form.fields.options}</label>
                  <input type="text" value={form.options} onChange={(e) => setForm((f) => ({ ...f, options: e.target.value }))}
                    placeholder={t.form.fields.optionsPlaceholder}
                    className="w-full border border-gray-200 px-3 py-2 text-sm rounded outline-none focus:border-[#c9a84c]" />
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.required} onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))} className="accent-[#0f2167]" />
                  {t.form.fields.required}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="accent-[#0f2167]" />
                  {t.form.fields.active}
                </label>
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-[#0f2167] hover:bg-[#080f3a] disabled:opacity-50 text-white font-bold py-2.5 text-sm tracking-widest uppercase transition-colors rounded">
                  {saving ? t.form.saving : t.form.save}
                </button>
                <button onClick={() => { setShowForm(false); setError(''); }} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 text-sm transition-colors rounded">
                  {t.form.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { api } from '../lib/api.js';
import usePageTitle from '../lib/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { SITE } from '../config.js';

export default function Contact() {
  usePageTitle('Contact');
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: '', text: '' });
    try {
      const r = await api('/contact', { method: 'POST', body: form });
      setStatus({ type: 'ok', text: r.message });
      setForm({ ...form, message: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page contact">
      <div>
        <h1>Contact</h1>
        <p className="section-lead">Questions, corrections or ideas for a new lesson? Send a message or reach out directly.</p>
        <dl className="kv big">
          <dt>Founder</dt><dd>{SITE.founder}</dd>
          <dt>Phone</dt><dd><a href={SITE.phoneHref}>{SITE.phone}</a></dd>
          <dt>Email</dt><dd><a href={'mailto:' + SITE.email}>{SITE.email}</a></dd>
        </dl>
      </div>

      <form onSubmit={submit} className="form card">
        <label>Name<input value={form.name} onChange={set('name')} required minLength={2} maxLength={80} /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>Phone (optional)<input type="tel" value={form.phone} onChange={set('phone')} maxLength={20} /></label>
        <label>Message<textarea rows={5} value={form.message} onChange={set('message')} required minLength={10} maxLength={2000} /></label>
        {status.text && (
          <p className={status.type === 'ok' ? 'form-ok' : 'form-error'} role="status">{status.text}</p>
        )}
        <button className="btn" disabled={busy}>{busy ? 'Sending...' : 'Send message'}</button>
      </form>
    </div>
  );
}

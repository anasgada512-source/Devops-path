import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import usePageTitle from '../lib/usePageTitle.js';

export default function Register() {
  usePageTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth">
      <h1>Create your account</h1>
      <p className="muted">Free. You get a personal User ID and saved progress across devices.</p>
      <form onSubmit={submit} className="form">
        <label>Full name<input value={form.name} onChange={set('name')} required minLength={2} maxLength={60} autoComplete="name" /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} required autoComplete="email" /></label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set('password')} required minLength={8} autoComplete="new-password" />
          <small className="muted">At least 8 characters.</small>
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      </form>
      <p>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}

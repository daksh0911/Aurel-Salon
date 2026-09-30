import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import api, { msg } from '../api';
import { useAuth } from '../auth';
import { useToast } from '../components';

export default function Login() {
  const [mode, setMode] = useState('login'), [f, setF] = useState({ name: '', email: '', password: '' }), [busy, setBusy] = useState(false);
  const { user, login } = useAuth(), toast = useToast(), nav = useNavigate(), loc = useLocation();
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast('Enter a valid email address.', 1);
    if (f.password.length < 6) return toast('Password needs at least 6 characters.', 1);
    if (mode === 'register' && f.name.trim().length < 2) return toast('Enter your full name.', 1);
    setBusy(true);
    try { const d = (await api.post(`/auth/${mode}`, f)).data; login(d); toast(`Welcome, ${d.user.name}.`); nav(d.user.role === 'admin' ? '/admin' : loc.state?.from || '/book', { replace: true }); }
    catch (err) { toast(msg(err), 1); } finally { setBusy(false); }
  }
  return <div className="wrap page"><div className="two">
    <div><h1>Book your chair in three taps.</h1>
      <p className="hint big">Choose a service, your stylist and a free time. Admins manage schedules and appointments from the same login.</p>
      <div className="card" style={{ marginTop: 28 }}><h3>Demo accounts</h3><div className="chips" style={{ marginTop: 12 }}>
        <button className="btn g s" onClick={() => { setMode('login'); setF({ ...f, email: 'daksh@example.com', password: 'demo1234' }); }}>Customer</button>
        <button className="btn g s" onClick={() => { setMode('login'); setF({ ...f, email: 'admin@aurel.com', password: 'admin123' }); }}>Admin</button></div></div></div>
    <form className="card" onSubmit={submit} noValidate>
      <div className="tabs">{[['login', 'Log in'], ['register', 'Register']].map(([k, l]) => <button type="button" key={k} className="tab" aria-pressed={mode === k} onClick={() => setMode(k)}>{l}</button>)}</div>
      {mode === 'register' && <><label htmlFor="n">Full name</label><input id="n" value={f.name} onChange={set('name')} autoComplete="name" /></>}
      <label htmlFor="e">Email</label><input id="e" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
      <label htmlFor="p">Password</label><input id="p" type="password" value={f.password} onChange={set('password')} placeholder="At least 6 characters" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
      <div className="sum" style={{ border: 0, padding: 0 }}><span className="hint">{mode === 'login' ? 'Customers and admins log in here.' : 'New accounts are customer accounts.'}</span>
        <button className="btn" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create account'}</button></div>
    </form></div></div>;
}

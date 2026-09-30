import { useEffect, useState } from 'react';
import api, { msg } from '../api';
import { useAuth } from '../auth';
import { useToast } from '../components';

export default function Profile() {
  const { user, login } = useAuth(), toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: '' }), [email, setEmail] = useState(''), [pw, setPw] = useState({ current: '', next: '' });
  useEffect(() => { api.get('/auth/me').then((r) => { setF({ name: r.data.name, phone: r.data.phone || '' }); setEmail(r.data.email); }).catch((e) => toast(msg(e), 1)); }, []);
  async function save(e) {
    e.preventDefault();
    if (f.name.trim().length < 2) return toast('Enter your full name.', 1);
    try { login((await api.put('/auth/profile', f)).data); toast('Profile saved.'); } catch (err) { toast(msg(err), 1); }
  }
  async function change(e) {
    e.preventDefault();
    if (pw.next.length < 6) return toast('New password needs at least 6 characters.', 1);
    try { await api.put('/auth/password', pw); setPw({ current: '', next: '' }); toast('Password changed.'); } catch (err) { toast(msg(err), 1); }
  }
  return <div className="wrap page"><h2>Your profile</h2><div className="two">
    <form className="card" onSubmit={save} noValidate><h3>Details</h3>
      <label htmlFor="pn">Full name</label><input id="pn" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <label htmlFor="pe">Email</label><input id="pe" value={email} disabled />
      <label htmlFor="pp">Phone</label><input id="pp" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <button className="btn" style={{ marginTop: 16 }}>Save profile</button></form>
    <form className="card" onSubmit={change} noValidate><h3>Change password</h3>
      <label htmlFor="pc">Current password</label><input id="pc" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" />
      <label htmlFor="px">New password</label><input id="px" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" />
      <button className="btn" style={{ marginTop: 16 }}>Change password</button></form></div></div>;
}

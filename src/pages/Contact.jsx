import { useState } from 'react';
import api, { msg } from '../api';
import { useToast } from '../components';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' }), [sent, setSent] = useState(false), [busy, setBusy] = useState(false), toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    if (f.name.trim().length < 2) return toast('Enter your name.', 1);
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return toast('Enter a valid email address.', 1);
    if (f.message.trim().length < 10) return toast('Message needs at least 10 characters.', 1);
    setBusy(true);
    try { await api.post('/contact', { ...f, phone: f.phone || undefined }); setSent(true); setF({ name: '', email: '', phone: '', message: '' }); }
    catch (err) { toast(msg(err), 1); } finally { setBusy(false); }
  }
  return <div className="wrap page"><div className="two"><div><h1>Get in touch</h1>
    <p className="hint big">Questions about a service, a group booking or a special occasion? Send us a message and we will reply by email.</p>
    <div className="card" style={{ marginTop: 28 }}><h3>Visit us</h3><p style={{ margin: '8px 0 0' }}>24 Riverfront Road, Ahmedabad</p><p style={{ margin: '4px 0 0' }}>+91 98765 43210</p><p style={{ margin: '4px 0 0' }}>hello@aurelsalon.example</p><p className="hint" style={{ marginTop: 12 }}>Mon–Sat 10:00–19:00 · Sun 10:00–18:00</p></div></div>
    <form className="card" onSubmit={submit} noValidate>
      {sent ? <><h3>Message sent</h3><p className="hint" style={{ margin: '8px 0 16px' }}>Thank you. We will reply to your email soon.</p><button type="button" className="btn g" onClick={() => setSent(false)}>Send another message</button></> : <>
        <label htmlFor="cn" style={{ marginTop: 0 }}>Name</label><input id="cn" value={f.name} onChange={set('name')} autoComplete="name" />
        <label htmlFor="ce">Email</label><input id="ce" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
        <label htmlFor="cp">Phone (optional)</label><input id="cp" value={f.phone} onChange={set('phone')} autoComplete="tel" />
        <label htmlFor="cm">Message</label><textarea id="cm" rows="5" value={f.message} onChange={set('message')} />
        <button className="btn" style={{ marginTop: 16 }} disabled={busy}>Send message</button></>}
    </form></div></div>;
}

import { useEffect, useState } from 'react';
import api, { msg, P, fd, iso, money } from '../api';
import { Chip, useToast } from '../components';

const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const Badge = ({ s }) => <span className={`bd ${s}`}>{s}</span>;
function useList(url, params) {
  const [d, setD] = useState([]), toast = useToast();
  const load = () => api.get(url, { params }).then((r) => setD(r.data)).catch((e) => toast(msg(e), 1));
  useEffect(() => { load(); }, [JSON.stringify(params)]);
  return [d, load, setD];
}

export function Dashboard() {
  const [appts] = useList('/appointments'), [svcs] = useList('/services/all'), [staff] = useList('/staff');
  const today = iso(new Date()), tl = appts.filter((a) => a.date === today && a.status === 'booked');
  const upcoming = appts.filter((a) => a.status === 'booked' && a.date >= today).length;
  return <><h2>Dashboard</h2>
    <div className="grid" style={{ marginBottom: 24 }}>{[[tl.length, 'Booked today'], [upcoming, 'Upcoming'], [money(appts.filter((x) => x.status === 'completed').reduce((t, x) => t + x.service.price, 0)), 'Revenue (completed)'], [staff.length, 'Stylists']].map(([n, l]) => <div className="card stat" key={l}><b>{n}</b><span>{l}</span></div>)}</div>
    <div className="card"><h3 style={{ marginBottom: 12 }}>Today's schedule</h3>
      {tl.map((a) => <div className="ap" key={a._id} style={{ padding: '8px 0', borderTop: '1px solid var(--ln)' }}><span><b>{P(a.start)}</b> {a.service.name} · {a.customer.name}</span><span className="hint">{a.staff.name}</span></div>)}
      {!tl.length && <p className="hint">No appointments booked for today.</p>}</div></>;
}

export function Services() {
  const blank = { name: '', description: '', duration: '', price: '' };
  const [list, load] = useList('/services/all'), [f, setF] = useState(blank), [id, setId] = useState(null), toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const reset = () => { setF(blank); setId(null); };
  async function save() {
    if (f.name.trim().length < 2) return toast('Enter a service name.', 1);
    if (!(f.duration >= 15 && f.duration <= 240)) return toast('Duration must be between 15 and 240 minutes.', 1);
    if (!(f.price > 0)) return toast('Enter a price above 0.', 1);
    try { id ? await api.put(`/services/${id}`, f) : await api.post('/services', f); toast(id ? 'Service updated.' : 'Service added.'); reset(); load(); } catch (e) { toast(msg(e), 1); }
  }
  const act = (fn, ok) => async () => { try { await fn(); ok && toast(ok); load(); } catch (e) { toast(msg(e), 1); } };
  return <><h2>Services</h2>
    <div className="card" style={{ marginBottom: 20 }}><h3>{id ? 'Edit service' : 'Add a service'}</h3><div className="row">
      <div><label htmlFor="sn">Name</label><input id="sn" value={f.name} onChange={set('name')} /></div>
      <div><label htmlFor="sm">Duration (min)</label><input id="sm" type="number" value={f.duration} onChange={set('duration')} /></div>
      <div><label htmlFor="sp">Price (₹)</label><input id="sp" type="number" value={f.price} onChange={set('price')} /></div></div>
      <label htmlFor="sd">Description</label><input id="sd" value={f.description} onChange={set('description')} placeholder="Shown to customers on the Services page" />
      <div className="chips" style={{ marginTop: 14 }}><button className="btn" onClick={save}>{id ? 'Save changes' : 'Add service'}</button>{id && <button className="btn g" onClick={reset}>Cancel</button>}</div></div>
    <div className="card tw"><table><thead><tr><th>Service</th><th>Duration</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map((x) => <tr key={x._id}><td>{x.name}</td><td>{x.duration} min</td><td>{money(x.price)}</td><td>{x.active ? 'Visible' : 'Hidden'}</td>
        <td className="a"><button className="btn g s" onClick={() => { setId(x._id); setF({ name: x.name, description: x.description || '', duration: x.duration, price: x.price }); window.scrollTo(0, 0); }}>Edit</button>
          <button className="btn g s" onClick={act(() => api.put(`/services/${x._id}`, { active: !x.active }))}>{x.active ? 'Hide' : 'Show'}</button>
          <button className="btn d s" onClick={act(() => api.delete(`/services/${x._id}`), 'Service deleted.')}>Delete</button></td></tr>)}</tbody></table></div></>;
}

export function Staff() {
  const [list, load] = useList('/staff'), [svcs] = useList('/services/all'), [f, setF] = useState({ name: '', role: '', bio: '' }), toast = useToast();
  const run = (fn, ok) => async () => { try { await fn(); ok && toast(ok); load(); } catch (e) { toast(msg(e), 1); } };
  const toggle = (t, sid) => run(() => api.put(`/staff/${t._id}`, { name: t.name, services: t.services.includes(sid) ? t.services.filter((x) => x !== sid) : [...t.services, sid] }));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async () => {
    if (f.name.trim().length < 2) return toast("Enter the stylist's name.", 1);
    try { await api.post('/staff', { name: f.name, role: f.role || undefined, bio: f.bio || undefined }); setF({ name: '', role: '', bio: '' }); toast('Stylist added. Set their hours under Availability.'); load(); } catch (e) { toast(msg(e), 1); }
  };
  return <><h2>Staff</h2>
    <div className="card" style={{ marginBottom: 20 }}><h3>Add a stylist</h3><div className="row">
      <div><label htmlFor="tn">Name</label><input id="tn" value={f.name} onChange={set('name')} /></div>
      <div><label htmlFor="tr">Role</label><input id="tr" value={f.role} onChange={set('role')} /></div></div>
      <label htmlFor="tb">Short bio</label><input id="tb" value={f.bio} onChange={set('bio')} placeholder="Shown on the Team page" />
      <button className="btn" style={{ marginTop: 14 }} onClick={add}>Add stylist</button></div>
    <div className="grid">{list.map((t) => <div className="card" key={t._id}><h3>{t.name}</h3><p className="hint">{t.role}</p>
      <div className="lbl">Services offered</div><div className="chips">{svcs.map((x) => <Chip key={x._id} on={t.services.includes(x._id)} onClick={toggle(t, x._id)}>{x.name}</Chip>)}</div>
      <button className="btn d s" style={{ marginTop: 16 }} onClick={run(() => api.delete(`/staff/${t._id}`), 'Stylist removed.')}>Remove</button></div>)}</div></>;
}

export function Availability() {
  const [list, load] = useList('/staff'), toast = useToast();
  const save = async (t, patch) => { try { await api.put(`/staff/${t._id}`, { name: t.name, ...patch }); load(); } catch (e) { toast(msg(e), 1); load(); } };
  const hr = (t, k) => <select aria-label={k === 'from' ? 'Opens' : 'Closes'} value={t[k]} onChange={(e) => save(t, { [k]: +e.target.value })}>{[...Array(18)].map((_, i) => i + 7).map((h) => <option key={h} value={h}>{P(h * 60)}</option>)}</select>;
  return <><h2>Availability</h2><p className="hint" style={{ marginBottom: 16 }}>Customers only see free times inside these working days and hours.</p>
    <div className="grid">{list.map((t) => <div className="card" key={t._id}><h3>{t.name}</h3><div className="lbl">Working days</div>
      <div className="chips">{DN.map((d, i) => <Chip key={d} on={t.days[i]} onClick={() => save(t, { days: t.days.map((v, j) => (j === i ? !v : v)) })}>{d}</Chip>)}</div>
      <div className="row"><div><label>Opens</label>{hr(t, 'from')}</div><div><label>Closes</label>{hr(t, 'to')}</div></div></div>)}</div></>;
}

export function AllAppointments() {
  const [f, setF] = useState({}), [staff] = useList('/staff'), toast = useToast();
  const [list, load] = useList('/appointments', Object.fromEntries(Object.entries(f).filter(([, v]) => v)));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const status = (a, s) => async () => { try { await api.patch(`/appointments/${a._id}/status`, { status: s }); toast(s === 'completed' ? 'Marked as completed.' : 'Appointment cancelled.'); load(); } catch (e) { toast(msg(e), 1); } };
  return <><h2>All appointments</h2>
    <div className="card row" style={{ marginBottom: 16 }}>
      <div><label htmlFor="fd">Date</label><input id="fd" type="date" value={f.date || ''} onChange={set('date')} /></div>
      <div><label htmlFor="fs">Stylist</label><select id="fs" value={f.staff || ''} onChange={set('staff')}><option value="">All</option>{staff.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
      <div><label htmlFor="ft">Status</label><select id="ft" value={f.status || ''} onChange={set('status')}><option value="">All</option>{['booked', 'completed', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></div>
      <button className="btn g" onClick={() => setF({})}>Clear filters</button></div>
    <div className="card tw"><table><thead><tr><th>Customer</th><th>Service</th><th>Stylist</th><th>When</th><th>Status</th><th></th></tr></thead><tbody>
      {list.map((a) => <tr key={a._id}><td>{a.customer.name}</td><td>{a.service.name}</td><td>{a.staff.name}</td><td>{fd(a.date)}, {P(a.start)}</td><td><Badge s={a.status} /></td>
        <td className="a">{a.status === 'booked' && <><button className="btn g s" onClick={status(a, 'completed')}>Complete</button><button className="btn d s" onClick={status(a, 'cancelled')}>Cancel</button></>}</td></tr>)}
      {!list.length && <tr><td colSpan="6" className="hint">No appointments match these filters.</td></tr>}</tbody></table></div></>;
}

export function Messages() {
  const [list, load] = useList('/contact'), toast = useToast();
  const run = (fn, ok) => async () => { try { await fn(); ok && toast(ok); load(); } catch (e) { toast(msg(e), 1); } };
  return <><h2>Messages</h2><div className="stack">{list.map((m) => <div className="card" key={m._id}>
    <div className="ap"><div><h3>{m.name} {!m.read && <span className="bd">new</span>}</h3><p className="hint">{m.email}{m.phone ? ` · ${m.phone}` : ''} · {m.createdAt}</p></div>
      <div className="chips"><button className="btn g s" onClick={run(() => api.patch(`/contact/${m._id}/read`))}>{m.read ? 'Mark unread' : 'Mark read'}</button><button className="btn d s" onClick={run(() => api.delete(`/contact/${m._id}`), 'Message deleted.')}>Delete</button></div></div>
    <p style={{ margin: '12px 0 0' }}>{m.message}</p></div>)}
    {!list.length && <div className="card"><p className="hint">No messages yet. Messages sent from the Contact page appear here.</p></div>}</div></>;
}

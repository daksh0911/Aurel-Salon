import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { msg, P, fd, isUpcoming } from '../api';
import { Modal, SlotPicker, useToast } from '../components';

export default function Mine() {
  const [list, setList] = useState([]), [tab, setTab] = useState('up'), [m, setM] = useState(null), [d, setD] = useState(null), [k, setK] = useState(null), [nonce, setNonce] = useState(0);
  const toast = useToast(), nav = useNavigate();
  const load = () => api.get('/appointments/my').then((r) => setList(r.data)).catch((e) => toast(msg(e), 1));
  useEffect(() => { load(); }, []);
  const up = list.filter(isUpcoming).reverse(), hi = list.filter((a) => !isUpcoming(a)), rows = tab === 'up' ? up : hi;
  const close = () => { setM(null); setD(null); setK(null); };
  async function cancel() { try { await api.patch(`/appointments/${m.a._id}/cancel`); toast('Appointment cancelled.'); close(); load(); } catch (e) { toast(msg(e), 1); } }
  async function resched() {
    try { await api.put(`/appointments/${m.a._id}/reschedule`, { date: d, start: k }); toast('Rescheduled.'); close(); load(); }
    catch (e) { toast(msg(e), 1); setK(null); setNonce(nonce + 1); }
  }
  return <div className="wrap page">
    <h2>My appointments</h2>
    <div className="tabs">{[['up', `Upcoming (${up.length})`], ['hi', `History (${hi.length})`]].map(([key, l]) => <button key={key} className="tab" aria-pressed={tab === key} onClick={() => setTab(key)}>{l}</button>)}</div>
    <div className="stack">{rows.map((a) => <div className="card ap" key={a._id}>
      <div><h3>{a.service.name} with {a.staff.name}</h3><p>{fd(a.date)} at {P(a.start)} · ₹{a.service.price} <span className={`bd ${a.status}`}>{a.status}</span></p></div>
      {tab === 'up' && <div className="chips"><button className="btn g s" onClick={() => setM({ t: 'rs', a })}>Reschedule</button><button className="btn d s" onClick={() => setM({ t: 'cx', a })}>Cancel</button></div>}
    </div>)}
    {!rows.length && <div className="card"><p className="hint">{tab === 'up' ? 'No upcoming appointments.' : 'No past appointments yet.'}</p>{tab === 'up' && <button className="btn" style={{ marginTop: 12 }} onClick={() => nav('/')}>Book an appointment</button>}</div>}</div>
    {m?.t === 'cx' && <Modal title="Cancel this appointment?" onClose={close}><p className="hint" style={{ margin: '10px 0 16px' }}>{m.a.service.name} with {m.a.staff.name}, {fd(m.a.date)} at {P(m.a.start)}. The time becomes available to others.</p><button className="btn d" onClick={cancel}>Cancel appointment</button></Modal>}
    {m?.t === 'rs' && <Modal title={`Reschedule ${m.a.service.name}`} onClose={close}><p className="hint">With {m.a.staff.name}. Currently {fd(m.a.date)} at {P(m.a.start)}.</p>
      <SlotPicker staffId={m.a.staff._id} serviceId={m.a.service._id} date={d} setDate={setD} start={k} setStart={setK} ignore={m.a._id} nonce={nonce} />
      <button className="btn" style={{ marginTop: 16 }} disabled={k === null} onClick={resched}>Save new time</button></Modal>}
  </div>;
}

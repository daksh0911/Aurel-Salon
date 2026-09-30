import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api, { msg, P, fd } from '../api';
import { Chip, SlotPicker, useToast } from '../components';

export default function Book() {
  const [svcs, setSvcs] = useState([]), [staff, setStaff] = useState([]);
  const [s, setS] = useState(null), [t, setT] = useState(null), [d, setD] = useState(null), [k, setK] = useState(null), [nonce, setNonce] = useState(0), [busy, setBusy] = useState(false);
  const toast = useToast(), nav = useNavigate(), [sp] = useSearchParams(), init = useRef(Object.fromEntries(sp));
  useEffect(() => { api.get('/services').then((r) => { setSvcs(r.data); const x = r.data.find((v) => String(v._id) === init.current.service); if (x) setS(x); }).catch((e) => toast(msg(e), 1)); }, []);
  useEffect(() => {
    setT(null); setD(null); setK(null); setStaff([]);
    if (s) api.get('/staff', { params: { serviceId: s._id } }).then((r) => { setStaff(r.data); const i = init.current, x = i.staff && r.data.find((v) => String(v._id) === i.staff); if (x) { setT(x); if (i.date) setD(i.date); if (i.time) setK(+i.time); } init.current = {}; }).catch((e) => toast(msg(e), 1));
  }, [s]);
  async function confirm() {
    setBusy(true);
    try { await api.post('/appointments', { serviceId: s._id, staffId: t._id, date: d, start: k }); toast('Booked. Find it under Upcoming.'); nav('/appointments'); }
    catch (e) { toast(msg(e), 1); setK(null); setNonce(nonce + 1); } finally { setBusy(false); }
  }
  const ok = s && t && d && k !== null;
  return <div className="wrap page"><div className="two">
    <div><h1>Book an appointment</h1><p className="hint big">Pick a service, then a stylist who offers it, then a free time. You can reschedule or cancel later under My appointments.</p></div>
    <div className="card">
      <div className="lbl" style={{ marginTop: 0 }}>Service</div>
      <div className="chips">{svcs.map((x) => <Chip key={x._id} on={s?._id === x._id} onClick={() => setS(x)}>{x.name}<small>{x.duration} min · ₹{x.price}</small></Chip>)}</div>
      <div className="lbl">Stylist</div>
      {!s ? <p className="hint">Choose a service first.</p> : <div className="chips">{staff.map((x) => <Chip key={x._id} on={t?._id === x._id} onClick={() => { setT(x); setK(null); }}>{x.name}</Chip>)}{!staff.length && <p className="hint">No stylist offers this service yet.</p>}</div>}
      <SlotPicker staffId={t?._id} serviceId={s?._id} date={d} setDate={setD} start={k} setStart={setK} nonce={nonce} />
      <div className="sum"><p className="hint" style={{ color: 'var(--ink)' }}>{ok ? <><b>{s.name}</b> with {t.name}, {fd(d)} at {P(k)} · <b>₹{s.price}</b></> : 'Select all four to continue.'}</p>
        <button className="btn" disabled={!ok || busy} onClick={confirm}>Confirm booking</button></div>
    </div></div></div>;
}

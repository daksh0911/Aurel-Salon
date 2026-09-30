import { Link } from 'react-router-dom';
import { dayRange, P } from '../api';
import { useGet, Offline } from '../components';

export default function Team() {
  const { data: staff, err } = useGet('/staff'), { data: svcs } = useGet('/services');
  return <div className="wrap page"><h1>Our stylists</h1>
    <p className="hint big">Choose who you sit with. Each stylist offers a different set of services and works their own hours.</p>
    {err && <div style={{ marginTop: 20 }}><Offline /></div>}
    <div className="grid" style={{ marginTop: 32 }}>{staff?.map((t) => {
      const mine = svcs?.filter((s) => t.services.includes(s._id)) || [];
      return <div className="card" key={t._id}><div className="staffc"><div className="av">{t.name[0]}</div><div><h3>{t.name}</h3><p className="hint">{t.role}</p></div></div>
        <p style={{ margin: '14px 0' }}>{t.bio}</p>
        <div className="chips">{mine.map((s) => <span className="chip tag" key={s._id}>{s.name}</span>)}</div>
        <p className="hint" style={{ marginTop: 14 }}>{dayRange(t.days)}, {P(t.from * 60)}–{P(t.to * 60)}</p>
        {mine[0] && <Link to={`/book?service=${mine[0]._id}&staff=${t._id}`} className="btn s" style={{ marginTop: 14 }}>Book with {t.name}</Link>}</div>;
    })}</div></div>;
}

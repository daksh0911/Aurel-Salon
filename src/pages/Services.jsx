import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../api';
import { useGet, Offline, Reveal, SpotlightCard } from '../components';

export default function Services() {
  const { data: svcs, err } = useGet('/services'), { data: staff } = useGet('/staff');
  const [filter, setFilter] = useState('All rituals'), [sort, setSort] = useState('featured'), [view, setView] = useState('grid');
  const filters = ['All rituals', 'Hair', 'Colour', 'Skin & spa'];
  const visible = useMemo(() => {
    const list = (svcs || []).filter((s) => filter === 'All rituals' || (filter === 'Hair' && /haircut|hair spa|blowout|scalp/i.test(s.name)) || (filter === 'Colour' && /colour|gloss|tone/i.test(s.name)) || (filter === 'Skin & spa' && /facial|spa|brow|hand|makeup/i.test(s.name)));
    return [...list].sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'duration' ? a.duration - b.duration : a._id - b._id);
  }, [svcs, filter, sort]);
  return <div className="wrap page"><Reveal><div className="eyebrow">The Aurel menu</div><h1>Services & prices</h1>
    <p className="hint big">Every ritual shows its duration, price and the specialist who can make it yours.</p></Reveal>
    {err && <div style={{ marginTop: 20 }}><Offline /></div>}
    <div className="catalog-tools"><div className="filter-bar" aria-label="Filter services">{filters.map((item) => <button key={item} className={`filter-pill${filter === item ? ' active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="catalog-actions"><span>{visible.length} rituals</span><select aria-label="Sort services" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Recommended</option><option value="price">Price: low to high</option><option value="duration">Shortest first</option></select><div className="view-switch"><button aria-label="Grid view" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>▦</button><button aria-label="List view" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>☰</button></div></div></div>
    <div className={`grid service-catalog ${view}`} style={{ marginTop: 26 }}>{visible.map((s, i) => {
      const who = staff?.filter((t) => t.services.includes(s._id)).map((t) => t.name).join(', ');
      return <Reveal key={s._id} delay={i * 45}><SpotlightCard className="card svc"><div className="eyebrow">{String(i + 1).padStart(2, '0')} / {s.duration} min</div><h3>{s.name}</h3><p>{s.description}</p><div className="price">{money(s.price)}</div>
        <p>{who ? `With ${who}` : 'Our specialist team'}</p><Link to={`/book?service=${s._id}`} className="btn s" style={{ marginTop: 12, alignSelf: 'flex-start' }}>Book this ritual</Link></SpotlightCard></Reveal>;
    })}</div>{!visible.length && <div className="card empty-state"><p className="hint">No rituals match this filter yet.</p></div>}</div>;
}

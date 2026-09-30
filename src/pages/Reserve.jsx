import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { money } from '../api';
import { Magnetic, Reveal, SpotlightCard, useGet } from '../components';

export default function Reserve() {
  const { data: services, err } = useGet('/services');
  const { data: staff } = useGet('/staff');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Hair', 'Colour', 'Skin & spa'];
  const visible = useMemo(() => (services || []).filter((s) => filter === 'All' || (filter === 'Hair' && /haircut|hair spa/i.test(s.name)) || (filter === 'Colour' && /colour/i.test(s.name)) || (filter === 'Skin & spa' && /facial|spa/i.test(s.name))), [services, filter]);
  useEffect(() => { const wanted = params.get('service'); if (wanted && services?.length) setSelected(services.find((s) => String(s._id) === wanted) || null); }, [services, params]);
  const specialistCount = selected ? (staff || []).filter((t) => t.services.includes(selected._id)).length : 0;
  const continueToBooking = () => {
    if (!selected) return;
    const target = `/book?service=${selected._id}`;
    navigate(user ? target : '/login', user ? undefined : { state: { from: target } });
  };
  return <div className="reserve-page">
    <section className="reserve-hero wrap"><Reveal><div className="eyebrow">Reservation concierge</div><h1>Start with how<br/><em>you want to feel.</em></h1><p className="hero-copy">Choose a ritual first. We’ll take you to the right specialist and show you the times that are genuinely available.</p><div className="reserve-trust"><span><b>01</b>Choose your ritual</span><span><b>02</b>Meet your specialist</span><span><b>03</b>Reserve your time</span></div></Reveal><Reveal delay={120}><div className="reserve-orb"><span>your<br/>time<br/><i>held</i></span></div></Reveal></section>
    <section className="reserve-picker wrap"><div className="reserve-picker-head"><div><div className="eyebrow">Step 01 / The ritual</div><h2>What are we making time for?</h2></div><p className="hint">No account needed to explore. Sign in only when you’re ready to reserve.</p></div>
      <div className="filter-bar reserve-filters">{filters.map((item) => <button key={item} className={`filter-pill${filter === item ? ' active' : ''}`} onClick={() => setFilter(item)}>{item}</button>)}</div>
      {err && <div className="card reserve-error"><p className="hint">We’re refreshing the menu. Please try again in a moment.</p></div>}
      <div className="reserve-grid">{visible.map((service, index) => { const chosen = selected?._id === service._id; const count = (staff || []).filter((t) => t.services.includes(service._id)).length; return <Reveal key={service._id} delay={index * 55}><SpotlightCard className={`reserve-service${chosen ? ' chosen' : ''}`}><button className="reserve-service-hit" onClick={() => setSelected(service)} aria-pressed={chosen}><span className="eyebrow">0{index + 1} / {service.duration} min</span><h3>{service.name}</h3><p>{service.description}</p><div className="reserve-service-foot"><strong>{money(service.price)}</strong><span>{count} specialist{count === 1 ? '' : 's'}</span></div></button></SpotlightCard></Reveal>; })}</div>
    </section>
    <section className="reserve-summary"><div className="wrap reserve-summary-inner"><div><div className="eyebrow">Your reservation brief</div><h2>{selected ? selected.name : 'Nothing selected yet.'}</h2><p>{selected ? `${selected.duration} minutes · ${specialistCount} specialist${specialistCount === 1 ? '' : 's'} available · ${money(selected.price)}` : 'Select a ritual above and we’ll prepare the next step.'}</p></div><Magnetic><button className="btn" disabled={!selected} onClick={continueToBooking}>{user ? 'Choose a time' : 'Continue as a client'} <span aria-hidden="true">↗</span></button></Magnetic></div></section>
    <section className="wrap reserve-note"><p className="eyebrow">A note from Aurel</p><p>We keep the journey considered. You can browse freely, choose your person and see real availability before anything is confirmed.</p></section>
  </div>;
}

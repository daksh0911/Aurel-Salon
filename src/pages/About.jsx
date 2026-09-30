import { Link } from 'react-router-dom';
export default function About() {
  return <div className="wrap page"><div className="two"><div><h1>A salon that respects your time.</h1></div>
    <div><p className="hint big" style={{ marginTop: 0 }}>Aurel Salon started with a simple idea: booking a haircut should not need a phone call, a wait, or a guess about who is free.</p>
      <p style={{ marginTop: 18, maxWidth: '60ch' }}>We are a small studio with three specialists in hair, colour and skin. Our online booking shows each stylist's real schedule, so the time you pick is the time you get. If plans change, you can reschedule or cancel yourself, any time before your visit.</p></div></div>
    <div className="grid" style={{ marginTop: 48 }}>{[['Care first', 'We take time to understand what you want before we start, and we use products that are kind to hair and skin.'], ['Honest pricing', 'The price and duration of every service are shown before you book. No surprises at the desk.'], ['Your schedule', 'Book, move or cancel online in a few taps. Your full appointment history stays in your account.']].map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p className="hint" style={{ marginTop: 8 }}>{d}</p></div>)}</div>
    <div className="card" style={{ marginTop: 32 }}><h3>Opening hours</h3><table style={{ minWidth: 0, marginTop: 8 }}><tbody><tr><td>Monday to Saturday</td><td>10:00–19:00</td></tr><tr><td>Sunday (spa and facials)</td><td>10:00–18:00</td></tr></tbody></table></div>
    <p style={{ marginTop: 28 }}><Link to="/book" className="btn">Book an appointment</Link></p></div>;
}

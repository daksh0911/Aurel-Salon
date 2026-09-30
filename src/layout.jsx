import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

const PUBLIC = [['/', 'Home'], ['/services', 'Services'], ['/team', 'The team'], ['/about', 'Our story'], ['/contact', 'Contact']];

export function Header() {
  const { user, logout } = useAuth(), [open, setOpen] = useState(false), nav = useNavigate();
  const extra = !user ? [] : user.role === 'admin' ? [['/admin', 'Admin studio']] : [['/appointments', 'My appointments']];
  return <header className="top"><div className="wrap">
    <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark" aria-hidden="true">A</span><span className="brand-name">Aurel</span></Link>
    <button type="button" className="burger btn g s" title={open ? 'Close navigation' : 'Open navigation'} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}><span className="menu-icon" aria-hidden="true">{open ? '×' : '☰'}</span><span>{open ? 'Close' : 'Menu'}</span></button>
    <div id="site-navigation" className={`menu${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
      <nav aria-label="Main">{[...PUBLIC, ...extra].map(([to, l]) => <NavLink key={to} to={to} end={to === '/'}>{l}</NavLink>)}</nav>
      <div className="acts">
        {user ? <><Link to="/profile" className="who">{user.name}</Link><button className="btn g s" onClick={() => { logout(); nav('/'); }}>Sign out</button></>
          : <Link to="/login" className="btn g s">Client login</Link>}
        {(!user || user.role === 'customer') && <Link to="/reserve" className="btn s">Reserve a visit</Link>}
      </div>
    </div>
  </div></header>;
}

export function Footer() {
  return <footer className="foot"><div className="wrap fg">
    <div><div className="brand"><span className="brand-mark" aria-hidden="true">A</span><span className="brand-name">Aurel</span></div><p className="hint" style={{ marginTop: 12, maxWidth: '32ch' }}>A considered salon experience for hair, skin and the rituals in between.</p></div>
    <div><h3>Explore</h3>{PUBLIC.slice(1).map(([to, l]) => <Link key={to} to={to}>{l}</Link>)}<Link to="/reserve">Reserve a visit</Link></div>
    <div><h3>Hours</h3><p>Mon–Sat, 10:00–19:00</p><p>Sunday, 10:00–18:00</p><p>Appointments recommended</p></div>
    <div><h3>Visit</h3><p>24 Riverfront Road<br/>Ahmedabad, Gujarat</p><p>+91 98765 43210</p><p>hello@aurelsalon.example</p></div>
  </div><div className="wrap legal">© {new Date().getFullYear()} Aurel Salon Studio. All rights reserved.</div></footer>;
}

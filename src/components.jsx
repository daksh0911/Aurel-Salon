import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import api, { msg, P, days14 } from './api';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const show = useCallback((text, err) => { setT({ text, err }); clearTimeout(show.h); show.h = setTimeout(() => setT(null), 3200); }, []);
  return <ToastCtx.Provider value={show}>{children}<div id="toast" role="status" aria-live="polite" className={t ? `show${t.err ? ' err' : ''}` : ''}>{t?.text}</div></ToastCtx.Provider>;
}

export function Modal({ title, children, onClose }) {
  return <div className="ov" role="dialog" aria-modal="true" aria-label={title}><div className="card"><h3>{title}</h3>{children}<button className="btn g" style={{ marginTop: 16 }} onClick={onClose}>Close</button></div></div>;
}

export const Chip = ({ on, children, ...p }) => <button className="chip" aria-pressed={!!on} {...p}>{children}</button>;
export const Skeleton = ({ className = '' }) => <div className={`skeleton ${className}`} aria-hidden="true"><span /><span /><span /></div>;

// Lightweight, CSS-first motion primitives: no animation dependency is needed for the public experience.
export function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { node.classList.add('is-visible'); observer.disconnect(); } }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ '--reveal-delay': `${delay}ms` }}>{children}</div>;
}

export function SpotlightCard({ children, className = '' }) {
  const onMove = (event) => {
    const el = event.currentTarget, rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const rx = ((y / rect.height) - .5) * -5.5, ry = ((x / rect.width) - .5) * 7;
    el.style.setProperty('--spot-x', `${x}px`); el.style.setProperty('--spot-y', `${y}px`);
    el.style.setProperty('--tilt-x', `${rx}deg`); el.style.setProperty('--tilt-y', `${ry}deg`);
  };
  const reset = (event) => { event.currentTarget.style.setProperty('--tilt-x', '0deg'); event.currentTarget.style.setProperty('--tilt-y', '0deg'); };
  return <div className={`spotlight-card ${className}`} onPointerMove={onMove} onPointerLeave={reset}>{children}</div>;
}

export function ImmersiveScene() {
  return <div className="immersive-scene" aria-hidden="true">
    <div className="scene-grid" />
    <div className="scene-glow glow-a" />
    <div className="scene-glow glow-b" />
    <div className="scene-ring ring-a" />
    <div className="scene-ring ring-b" />
    <div className="scene-ring ring-c" />
    <div className="scene-orb"><span>A</span></div>
    <div className="scene-orbit orbit-a"><i /><i /><i /></div>
    <div className="scene-orbit orbit-b"><i /><i /></div>
    <div className="scene-wordmark">AUREL<span>STUDIO / AHMEDABAD</span></div>
    <div className="scene-note note-a">01 / QUIET LUXURY</div>
    <div className="scene-note note-b">02 / REAL AVAILABILITY</div>
  </div>;
}

export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
    update(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', update); };
  }, []);
  return <div className="scroll-progress" aria-hidden="true"><span ref={ref} /></div>;
}

export function Parallax({ children, strength = 0.14, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (ref.current) { const y = ref.current.getBoundingClientRect().top; ref.current.style.setProperty('--parallax-y', `${Math.max(-30, Math.min(30, -y * strength))}px`); }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { window.requestAnimationFrame(update); ticking = true; } };
    update(); window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [strength]);
  return <div ref={ref} className={`parallax ${className}`}>{children}</div>;
}

export function Magnetic({ children, className = '' }) {
  const ref = useRef(null);
  const move = (event) => { const rect = event.currentTarget.getBoundingClientRect(); ref.current.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`; };
  const reset = () => { if (ref.current) ref.current.style.transform = ''; };
  return <span ref={ref} className={`magnetic ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</span>;
}

// Date strip + free time slots for one stylist/service (used for booking and rescheduling)
export function SlotPicker({ staffId, serviceId, date, setDate, start, setStart, ignore, nonce }) {
  const [slots, setSlots] = useState(null);
  const toast = useToast();
  useEffect(() => {
    setSlots(null);
    if (!staffId || !serviceId || !date) return;
    api.get('/availability', { params: { staffId, serviceId, date, ignore } }).then((r) => setSlots(r.data)).catch((e) => toast(msg(e), 1));
  }, [staffId, serviceId, date, ignore, nonce]);
  return <>
    <div className="lbl">Date</div>
    <div className="chips">{days14().map((d) => <Chip key={d} className="chip day" on={date === d} onClick={() => { setDate(d); setStart(null); }}>
      <span>{new Date(`${d}T00:00`).toLocaleDateString('en-IN', { weekday: 'short' })}</span><b>{+d.slice(8)}</b></Chip>)}</div>
    <div className="lbl">Available times</div>
    {!staffId || !date ? <p className="hint">Pick a stylist and date to see free times.</p>
      : slots === null ? <p className="hint">Loading times…</p>
      : slots.length === 0 ? <p className="hint">No working hours for this stylist on this day. Choose another date.</p>
      : <div className="chips">{slots.map((s) => <Chip key={s.start} on={start === s.start} disabled={!s.available} onClick={() => setStart(s.start)}>{P(s.start)}</Chip>)}</div>}
  </>;
}

const publicGetCache = new Map();
export function useGet(url, params) {
  const [st, set] = useState({ data: null, err: false });
  useEffect(() => {
    let ok = true;
    const key = `${url}?${JSON.stringify(params || {})}`, cached = publicGetCache.get(key);
    if (cached && Date.now() - cached.at < 15000) { set({ data: cached.data, err: false }); return () => { ok = false; }; }
    api.get(url, { params }).then((r) => { publicGetCache.set(key, { data: r.data, at: Date.now() }); ok && set({ data: r.data, err: false }); }).catch(() => ok && set({ data: null, err: true }));
    return () => { ok = false; };
  }, [url, JSON.stringify(params)]);
  return st;
}
export const Offline = () => <p className="hint" role="status">Live salon data is temporarily unavailable. Please refresh or try again in a moment.</p>;

import axios from 'axios';
// Production/public builds are served with the API from the same origin. Only a local Vite
// dev server needs to reach across to the Express API on port 5000.
const localDev = ['5173', '4173', '5500', '5501'].includes(location.port);
const base = window.API_URL || (localDev ? `http://${location.hostname || 'localhost'}:5000/api` : '/api');
const api = axios.create({ baseURL: base });
api.interceptors.request.use((c) => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const msg = (e) => e.response?.data?.message || 'Cannot reach the server. Check that the API is running.';
export const P = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const fd = (s) => new Date(`${s}T00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const days14 = () => [...Array(14)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return iso(d); });
export const isUpcoming = (a) => { const n = new Date(); return a.status === 'booked' && `${a.date}T${P(a.start)}` >= `${iso(n)}T${P(n.getHours() * 60 + n.getMinutes())}`; };
export default api;
export const DN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const money = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
export const dayRange = (d) => { const o = []; let i = 0; while (i < 7) { if (!d[i]) { i++; continue; } let j = i; while (j + 1 < 7 && d[j + 1]) j++; o.push(j > i ? `${DN[i]}–${DN[j]}` : DN[i]); i = j + 1; } return o.join(', ') || 'Closed'; };

import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './auth';
import { Header, Footer } from './layout';
import { ScrollProgress } from './components';
import Home from './pages/Home';
import Services from './pages/Services';
import Team from './pages/Team';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Reserve from './pages/Reserve';
import Book from './pages/Book';
import Mine from './pages/Mine';
import Profile from './pages/Profile';
import { Dashboard, Services as AdminServices, Staff, Availability, AllAppointments, Messages } from './pages/admin';

// Sends visitors to the login page, and users with the wrong role to their own home page
function Need({ role, children }) {
  const { user } = useAuth(), loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}

function AdminShell() {
  const tabs = [['/admin', 'Dashboard'], ['/admin/services', 'Services'], ['/admin/staff', 'Staff'], ['/admin/availability', 'Availability'], ['/admin/appointments', 'Appointments'], ['/admin/messages', 'Messages']];
  return <div className="wrap page"><nav className="subnav" aria-label="Admin">{tabs.map(([to, l]) => <NavLink key={to} to={to} end={to === '/admin'}>{l}</NavLink>)}</nav><Outlet /></div>;
}

const NotFound = () => <div className="wrap page"><h1>Page not found</h1><p className="hint big">That page does not exist. Use the menu to find what you need.</p></div>;
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]); return null; }
export default function App() {
  return <><ScrollToTop /><ScrollProgress /><Header /><main><Routes>
    <Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/team" element={<Team />} />
    <Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/login" element={<Login />} /><Route path="/reserve" element={<Reserve />} />
    <Route path="/book" element={<Need role="customer"><Book /></Need>} />
    <Route path="/appointments" element={<Need role="customer"><Mine /></Need>} />
    <Route path="/profile" element={<Need><Profile /></Need>} />
    <Route path="/admin" element={<Need role="admin"><AdminShell /></Need>}>
      <Route index element={<Dashboard />} /><Route path="services" element={<AdminServices />} /><Route path="staff" element={<Staff />} />
      <Route path="availability" element={<Availability />} /><Route path="appointments" element={<AllAppointments />} /><Route path="messages" element={<Messages />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes></main><Footer /></>;
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import auth from './routes/auth.js';
import services from './routes/services.js';
import staff, { availability } from './routes/staff.js';
import appointments from './routes/appointments.js';
import contact from './routes/contact.js';
import { notFound, errorHandler } from './middleware.js';

// First run: fill an empty database with demo data
if (db.prepare('SELECT COUNT(*) c FROM users').get().c === 0) await import('./seed.js');

const app = express();
app.use(cors(), express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api', (req, res) => res.json({ name: 'Aurel Salon Appointment API', version: '1.0.0', resources: {
  auth: ['/api/auth/register', '/api/auth/login', '/api/auth/me'], services: ['/api/services'], staff: ['/api/staff'], availability: ['/api/availability', '/api/availability/next'], appointments: ['/api/appointments', '/api/appointments/my'], contact: ['/api/contact'],
} }));
app.use('/api/auth', auth);
app.use('/api/services', services);
app.use('/api/staff', staff);
app.use('/api/availability', availability);
app.use('/api/appointments', appointments);
app.use('/api/contact', contact);
// The built React site (../web) is also served here: http://localhost:5000
const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../web');
app.use(express.static(webRoot, { extensions: ['html'] }));
// React Router owns the public routes; serve the app shell on direct refreshes too.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(webRoot, 'index.html'));
});
app.use(notFound, errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));

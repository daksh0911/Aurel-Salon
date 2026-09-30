import 'dotenv/config';
process.env.JWT_SECRET ||= 'salon-dev-secret-change-me'; // works without a .env file
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const file = process.env.DB_FILE || path.join(path.dirname(fileURLToPath(import.meta.url)), 'salon.db');
export const db = new Database(file);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')));
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT,
  duration INTEGER NOT NULL, price REAL NOT NULL, active INTEGER NOT NULL DEFAULT 1);
-- days: JSON array Mon..Sun (1 = working); from_hour/to_hour: opening and closing hour
CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'Stylist', bio TEXT,
  days TEXT NOT NULL DEFAULT '[1,1,1,1,1,1,0]', from_hour INTEGER NOT NULL DEFAULT 10, to_hour INTEGER NOT NULL DEFAULT 19);
CREATE TABLE IF NOT EXISTS staff_services (
  staff_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE, PRIMARY KEY (staff_id, service_id));
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES users(id), service_id INTEGER NOT NULL REFERENCES services(id), staff_id INTEGER NOT NULL REFERENCES staff(id),
  date TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','completed','cancelled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
-- Database-level guard against double booking the same stylist and start time
CREATE UNIQUE INDEX IF NOT EXISTS uniq_booked ON appointments (staff_id, date, start_min) WHERE status = 'booked';
`);

try { db.exec('ALTER TABLE staff ADD COLUMN bio TEXT'); } catch { /* column already exists */ }

// Row mappers keep the API shape the React client expects (_id, nested service/staff/customer)
export const svcOf = (r) => r && { _id: r.id, name: r.name, description: r.description, duration: r.duration, price: r.price, active: !!r.active };
export const staffOf = (r) => r && {
  _id: r.id, name: r.name, role: r.role, bio: r.bio || '', days: JSON.parse(r.days).map(Boolean), from: r.from_hour, to: r.to_hour,
  services: db.prepare('SELECT service_id FROM staff_services WHERE staff_id = ?').pluck().all(r.id),
};
const APPT = `SELECT a.*, s.name sname, s.duration sdur, s.price sprice, st.name stname, u.name uname, u.email uemail, u.phone uphone
  FROM appointments a JOIN services s ON s.id = a.service_id JOIN staff st ON st.id = a.staff_id JOIN users u ON u.id = a.customer_id`;
const apptOf = (r) => ({
  _id: r.id, date: r.date, start: r.start_min, end: r.end_min, status: r.status,
  service: { _id: r.service_id, name: r.sname, duration: r.sdur, price: r.sprice }, staff: { _id: r.staff_id, name: r.stname },
  customer: { _id: r.customer_id, name: r.uname, email: r.uemail, phone: r.uphone },
});
export const getService = (id) => svcOf(db.prepare('SELECT * FROM services WHERE id = ?').get(id));
export const getStaff = (id) => staffOf(db.prepare('SELECT * FROM staff WHERE id = ?').get(id));
export const getAppt = (id) => { const r = db.prepare(`${APPT} WHERE a.id = ?`).get(id); return r && apptOf(r); };
export const listAppts = (where = '1=1', args = []) => db.prepare(`${APPT} WHERE ${where} ORDER BY a.date, a.start_min`).all(...args).map(apptOf);

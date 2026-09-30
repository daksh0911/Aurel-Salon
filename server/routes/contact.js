import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { auth, admin, validate, wrap, httpError } from '../middleware.js';
const r = Router();
const row = (m) => ({ _id: m.id, name: m.name, email: m.email, phone: m.phone, message: m.message, read: !!m.is_read, createdAt: m.created_at });

r.post('/', validate(z.object({
  name: z.string().trim().min(2, 'Enter your name'), email: z.string().trim().email('Enter a valid email'), phone: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, 'Message needs at least 10 characters').max(1000, 'Message is too long'),
})), wrap((req, res) => {
  const b = req.body;
  db.prepare('INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)').run(b.name, b.email, b.phone || null, b.message);
  res.status(201).json({ ok: true });
}));
r.get('/', auth, admin, wrap((req, res) => res.json(db.prepare('SELECT * FROM messages ORDER BY id DESC').all().map(row))));
r.patch('/:id/read', auth, admin, wrap((req, res) => {
  const m = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!m) throw httpError(404, 'Message not found.');
  db.prepare('UPDATE messages SET is_read = ? WHERE id = ?').run(m.is_read ? 0 : 1, m.id);
  res.json(row(db.prepare('SELECT * FROM messages WHERE id = ?').get(m.id)));
}));
r.delete('/:id', auth, admin, wrap((req, res) => { db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id); res.json({ ok: true }); }));
export default r;

import { Router } from 'express';
import { z } from 'zod';
import { db, svcOf, getService } from '../db.js';
import { auth, admin, validate, wrap, httpError } from '../middleware.js';
const r = Router();
const body = z.object({
  name: z.string().trim().min(2, 'Enter a service name'), description: z.string().trim().optional(),
  duration: z.coerce.number().int().min(15, 'Minimum 15 minutes').max(240, 'Maximum 240 minutes'),
  price: z.coerce.number().positive('Price must be above 0'), active: z.boolean().optional(),
});
const list = (where) => db.prepare(`SELECT * FROM services ${where} ORDER BY name`).all().map(svcOf);

r.get('/', wrap((req, res) => res.json(list('WHERE active = 1'))));
r.get('/all', auth, admin, wrap((req, res) => res.json(list(''))));
r.post('/', auth, admin, validate(body), wrap((req, res) => {
  const b = req.body;
  const id = db.prepare('INSERT INTO services (name, description, duration, price, active) VALUES (?, ?, ?, ?, ?)').run(b.name, b.description || null, b.duration, b.price, b.active === false ? 0 : 1).lastInsertRowid;
  res.status(201).json(getService(id));
}));
r.put('/:id', auth, admin, validate(body.partial()), wrap((req, res) => {
  const cur = getService(req.params.id);
  if (!cur) throw httpError(404, 'Service not found.');
  const b = { ...cur, ...req.body };
  db.prepare('UPDATE services SET name = ?, description = ?, duration = ?, price = ?, active = ? WHERE id = ?').run(b.name, b.description ?? null, b.duration, b.price, b.active ? 1 : 0, cur._id);
  res.json(getService(cur._id));
}));
r.delete('/:id', auth, admin, wrap((req, res) => {
  if (db.prepare('SELECT 1 FROM appointments WHERE service_id = ?').get(req.params.id)) throw httpError(409, 'This service has appointments. Hide it instead.');
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));
export default r;

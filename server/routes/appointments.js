import { Router } from 'express';
import { z } from 'zod';
import { db, getService, getStaff, getAppt, listAppts } from '../db.js';
import { auth, admin, validate, wrap, httpError } from '../middleware.js';
import { freeSlots } from '../slots.js';
const r = Router();
const when = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'), start: z.number().int().min(0).max(1439) });

function ensureFree(staff, service, date, start, ignoreId) {
  const s = freeSlots(staff, service, date, ignoreId).find((x) => x.start === start);
  if (!s || !s.available) throw httpError(409, 'That time is not available. Choose another slot.');
}
function own(req) {
  const a = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!a) throw httpError(404, 'Appointment not found.');
  if (req.user.role !== 'admin' && a.customer_id !== req.user.id) throw httpError(403, 'This is not your appointment.');
  return a;
}

r.post('/', auth, validate(when.extend({ serviceId: z.coerce.number().int(), staffId: z.coerce.number().int() })), wrap((req, res) => {
  const { serviceId, staffId, date, start } = req.body;
  const service = getService(serviceId), staff = getStaff(staffId);
  if (!service || !service.active) throw httpError(404, 'Service not found.');
  if (!staff || !staff.services.includes(service._id)) throw httpError(400, 'This stylist does not offer that service.');
  ensureFree(staff, service, date, start);
  const id = db.prepare('INSERT INTO appointments (customer_id, service_id, staff_id, date, start_min, end_min) VALUES (?, ?, ?, ?, ?, ?)').run(req.user.id, service._id, staff._id, date, start, start + service.duration).lastInsertRowid;
  res.status(201).json(getAppt(id));
}));
r.get('/my', auth, wrap((req, res) => res.json(listAppts('a.customer_id = ?', [req.user.id]).reverse())));
r.get('/', auth, admin, wrap((req, res) => {
  const w = ['1=1'], args = [];
  if (req.query.date) { w.push('a.date = ?'); args.push(req.query.date); }
  if (req.query.staff) { w.push('a.staff_id = ?'); args.push(req.query.staff); }
  if (req.query.status) { w.push('a.status = ?'); args.push(req.query.status); }
  res.json(listAppts(w.join(' AND '), args));
}));
r.put('/:id/reschedule', auth, validate(when), wrap((req, res) => {
  const a = own(req);
  if (a.status !== 'booked') throw httpError(400, 'Only booked appointments can be rescheduled.');
  const service = getService(a.service_id), staff = getStaff(a.staff_id);
  ensureFree(staff, service, req.body.date, req.body.start, a.id);
  db.prepare('UPDATE appointments SET date = ?, start_min = ?, end_min = ? WHERE id = ?').run(req.body.date, req.body.start, req.body.start + service.duration, a.id);
  res.json(getAppt(a.id));
}));
r.patch('/:id/cancel', auth, wrap((req, res) => {
  const a = own(req);
  if (a.status !== 'booked') throw httpError(400, 'Only booked appointments can be cancelled.');
  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(a.id);
  res.json(getAppt(a.id));
}));
r.patch('/:id/status', auth, admin, validate(z.object({ status: z.enum(['booked', 'completed', 'cancelled']) })), wrap((req, res) => {
  const a = getAppt(req.params.id);
  if (!a) throw httpError(404, 'Appointment not found.');
  if (req.body.status === 'booked') {
    const service = getService(a.service._id), staff = getStaff(a.staff._id);
    if (!service || !staff || !staff.services.includes(service._id)) throw httpError(409, 'This appointment no longer has a valid service or stylist.');
    ensureFree(staff, service, a.date, a.start, a._id);
  }
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(req.body.status, a._id);
  res.json(getAppt(a._id));
}));
export default r;

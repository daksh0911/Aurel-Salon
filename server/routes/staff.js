import { Router } from 'express';
import { z } from 'zod';
import { db, staffOf, getStaff, getService } from '../db.js';
import { auth, admin, validate, wrap, httpError } from '../middleware.js';
import { freeSlots } from '../slots.js';
const r = Router();
const body = z.object({
  name: z.string().trim().min(2, 'Enter the stylist name'), role: z.string().trim().optional(), bio: z.string().trim().max(300).optional(),
  services: z.array(z.number().int()).optional(), days: z.array(z.boolean()).length(7, 'Provide 7 day flags').optional(),
  from: z.number().int().min(0).max(23).optional(), to: z.number().int().min(1).max(24).optional(),
});
const setServices = (id, ids) => {
  db.prepare('DELETE FROM staff_services WHERE staff_id = ?').run(id);
  const ins = db.prepare('INSERT OR IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)');
  ids.forEach((s) => ins.run(id, s));
};
const hours = (b) => { if (b.from >= b.to) throw httpError(400, 'Opening time must be before closing time.'); };

r.get('/', wrap((req, res) => {
  const rows = req.query.serviceId
    ? db.prepare('SELECT st.* FROM staff st JOIN staff_services ss ON ss.staff_id = st.id WHERE ss.service_id = ? ORDER BY st.name').all(req.query.serviceId)
    : db.prepare('SELECT * FROM staff ORDER BY name').all();
  res.json(rows.map(staffOf));
}));
r.post('/', auth, admin, validate(body), wrap((req, res) => {
  const b = { role: 'Stylist', bio: '', services: [], days: [true, true, true, true, true, true, false], from: 10, to: 19, ...req.body };
  hours(b);
  const id = db.transaction(() => {
    const id = db.prepare('INSERT INTO staff (name, role, bio, days, from_hour, to_hour) VALUES (?, ?, ?, ?, ?, ?)').run(b.name, b.role, b.bio, JSON.stringify(b.days.map(Number)), b.from, b.to).lastInsertRowid;
    setServices(id, b.services);
    return id;
  })();
  res.status(201).json(getStaff(id));
}));
r.put('/:id', auth, admin, validate(body.partial()), wrap((req, res) => {
  const cur = getStaff(req.params.id);
  if (!cur) throw httpError(404, 'Stylist not found.');
  const b = { ...cur, ...req.body };
  hours(b);
  db.transaction(() => {
    db.prepare('UPDATE staff SET name = ?, role = ?, bio = ?, days = ?, from_hour = ?, to_hour = ? WHERE id = ?').run(b.name, b.role, b.bio ?? '', JSON.stringify(b.days.map(Number)), b.from, b.to, cur._id);
    if (req.body.services) setServices(cur._id, req.body.services);
  })();
  res.json(getStaff(cur._id));
}));
r.delete('/:id', auth, admin, wrap((req, res) => {
  if (db.prepare('SELECT 1 FROM appointments WHERE staff_id = ?').get(req.params.id)) throw httpError(409, 'This stylist has appointments and cannot be removed.');
  db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
}));

export const availability = Router().get('/', wrap((req, res) => {
  const { staffId, serviceId, date, ignore } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw httpError(400, 'date must be YYYY-MM-DD');
  const staff = getStaff(staffId), service = getService(serviceId);
  if (!staff || !service) throw httpError(404, 'Stylist or service not found.');
  res.json(freeSlots(staff, service, date, Number(ignore) || 0));
}));
availability.get('/next', wrap((req, res) => {
  res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY id').all().map((s) => ({ row: s, value: getService(s.id) }));
  const staffRows = db.prepare('SELECT * FROM staff ORDER BY name').all().map((s) => getStaff(s.id));
  const start = new Date(); start.setHours(0, 0, 0, 0);
  for (let offset = 0; offset < 14; offset += 1) {
    const dateObj = new Date(start); dateObj.setDate(start.getDate() + offset);
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    for (const { value: service } of services) {
      const match = staffRows.find((staff) => staff.services.includes(service._id) && freeSlots(staff, service, date).some((slot) => slot.available));
      if (match) return res.json({ service, staff: match, date, slots: freeSlots(match, service, date).filter((slot) => slot.available).slice(0, 4) });
    }
  }
  res.json(null);
}));
export default r;

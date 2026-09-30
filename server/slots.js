import { db } from './db.js';
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Builds 30-minute start times inside working hours and marks those overlapping a booked appointment.
export function freeSlots(staff, service, date, ignoreId = 0) {
  const now = new Date(), today = iso(now), nowMin = now.getHours() * 60 + now.getMinutes();
  if (date < today || !staff.days[(new Date(`${date}T00:00`).getDay() + 6) % 7]) return [];
  const booked = db.prepare("SELECT start_min s, end_min e FROM appointments WHERE staff_id = ? AND date = ? AND status = 'booked' AND id != ?").all(staff._id, date, ignoreId);
  const out = [];
  for (let m = staff.from * 60; m + service.duration <= staff.to * 60; m += 30) {
    if (date === today && m <= nowMin) continue;
    out.push({ start: m, time: hhmm(m), available: !booked.some((b) => m < b.e && b.s < m + service.duration) });
  }
  return out;
}

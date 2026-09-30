import bcrypt from 'bcryptjs';
import { db } from './db.js';

const iso = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
db.exec("DELETE FROM messages; DELETE FROM appointments; DELETE FROM staff_services; DELETE FROM staff; DELETE FROM services; DELETE FROM users; DELETE FROM sqlite_sequence;");
const user = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
user.run('Admin', 'admin@aurel.com', bcrypt.hashSync('admin123', 10), 'admin');
user.run('Daksh', 'daksh@example.com', bcrypt.hashSync('demo1234', 10), 'customer');

const svc = db.prepare('INSERT INTO services (name, description, duration, price) VALUES (?, ?, ?, ?)');
const [haircut, spa, colour, facial, scalp, glow, blowout, gloss, hands, makeup] = [
  ['Haircut', 'Wash, cut and blow-dry.', 30, 500], ['Hair spa', 'Deep conditioning and scalp massage.', 60, 1200],
  ['Hair colour', 'Global colour or highlights.', 90, 2500], ['Facial', 'Cleanse, exfoliate and mask.', 45, 900],
  ['Scalp ritual', 'A calming cleanse, massage and nourishing treatment.', 45, 1100], ['Brow & glow', 'Shape, soothe and brighten for a polished finish.', 30, 700],
  ['Signature blowout', 'A polished wash, finish and soft movement.', 45, 850], ['Gloss & tone', 'A luminous colour refresh with shine treatment.', 60, 1600],
  ['Hand ritual', 'Gentle shaping, cuticle care and a restorative finish.', 30, 600], ['Express makeup', 'A refined, occasion-ready makeup finish.', 45, 1400],
].map((s) => svc.run(...s).lastInsertRowid);

const stf = db.prepare('INSERT INTO staff (name, role, bio, days, from_hour, to_hour) VALUES (?, ?, ?, ?, ?, ?)');
const link = db.prepare('INSERT INTO staff_services VALUES (?, ?)');
const riya = stf.run('Riya', 'Senior stylist', 'Twelve years behind the chair. Precision cuts, blow-dries and restorative hair spa.', '[1,1,1,1,1,1,0]', 10, 19).lastInsertRowid;
const kabir = stf.run('Kabir', 'Colour specialist', 'Balayage, highlights and global colour, with a focus on keeping hair healthy.', '[1,1,1,1,1,0,0]', 11, 19).lastInsertRowid;
const meera = stf.run('Meera', 'Skin and spa', 'Certified aesthetician for facials, skin analysis and relaxing spa treatments.', '[0,1,1,1,1,1,1]', 10, 18).lastInsertRowid;
[[riya, haircut], [riya, spa], [riya, facial], [riya, scalp], [riya, blowout], [kabir, haircut], [kabir, colour], [kabir, gloss], [meera, spa], [meera, facial], [meera, scalp], [meera, glow], [meera, hands], [meera, makeup]].forEach((p) => link.run(...p));

// A little history so the demo customer's pages are not empty
const appt = db.prepare('INSERT INTO appointments (customer_id, service_id, staff_id, date, start_min, end_min, status) VALUES (2, ?, ?, ?, ?, ?, ?)');
appt.run(haircut, riya, iso(-9), 660, 690, 'completed');
appt.run(facial, meera, iso(-3), 840, 885, 'completed');
appt.run(spa, riya, iso(2), 720, 780, 'booked');
db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)').run('Sample visitor', 'visitor@example.com', 'Hi! Do you offer bridal packages? Please share the details.');
console.log('Seeded. Admin: admin@aurel.com / admin123   Customer: daksh@example.com / demo1234');

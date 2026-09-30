import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db.js';
import { auth, validate, wrap, httpError } from '../middleware.js';
const r = Router();
const out = (u) => ({
  token: jwt.sign({ id: u.id, role: u.role, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u.id, name: u.name, email: u.email, role: u.role },
});

r.post('/register', validate(z.object({
  name: z.string().trim().min(2, 'Enter your full name'), email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password needs at least 6 characters'), phone: z.string().trim().optional(),
})), wrap((req, res) => {
  const { name, email, password, phone } = req.body;
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw httpError(409, 'That email is already registered. Log in instead.');
  const id = db.prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'customer')").run(name, email.toLowerCase(), phone || null, bcrypt.hashSync(password, 10)).lastInsertRowid;
  res.status(201).json(out(db.prepare('SELECT * FROM users WHERE id = ?').get(id)));
}));
r.post('/login', validate(z.object({ email: z.string().trim().email('Enter a valid email'), password: z.string().min(1, 'Enter your password') })), wrap((req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(req.body.email);
  if (!u || !bcrypt.compareSync(req.body.password, u.password)) throw httpError(401, 'Email or password is incorrect.');
  res.json(out(u));
}));
r.get('/me', auth, wrap((req, res) => {
  const u = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(req.user.id);
  if (!u) throw httpError(401, 'Account not found.');
  res.json(u);
}));
r.put('/profile', auth, validate(z.object({ name: z.string().trim().min(2, 'Enter your full name'), phone: z.string().trim().max(20, 'Phone number is too long').optional() })), wrap((req, res) => {
  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(req.body.name, req.body.phone || null, req.user.id);
  res.json(out(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)));
}));
r.put('/password', auth, validate(z.object({ current: z.string().min(1, 'Enter your current password'), next: z.string().min(6, 'New password needs at least 6 characters') })), wrap((req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(req.body.current, u.password)) throw httpError(400, 'Current password is incorrect.');
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(req.body.next, 10), u.id);
  res.json({ ok: true });
}));
export default r;

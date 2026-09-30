import jwt from 'jsonwebtoken';
export const httpError = (status, message) => Object.assign(new Error(message), { status });
export const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };
export const auth = (req, res, next) => {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET); next(); }
  catch { next(httpError(401, 'Please log in to continue.')); }
};
export const admin = (req, res, next) => (req.user?.role === 'admin' ? next() : next(httpError(403, 'Admins only.')));
export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return next(httpError(400, r.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ')));
  req.body = r.data; next();
};
export const notFound = (req, res, next) => next(httpError(404, 'Route not found.'));
export const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must be valid JSON.' });
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ message: 'That email or time slot is already taken.' });
  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') return res.status(400).json({ message: 'Invalid reference to a service, stylist or user.' });
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on the server.' });
};

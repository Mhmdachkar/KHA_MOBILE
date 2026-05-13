import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';

export function signAdminToken(adminRow) {
  return jwt.sign(
    {
      sub: adminRow.id,
      email: adminRow.email,
      role: adminRow.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  let token = null;

  if (header?.startsWith('Bearer ')) {
    token = header.slice(7);
  } else if (req.query?.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'unibites_jwt_super_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please sign in to continue.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ error: 'Invalid authentication token format.' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid session token. Please log in again.' });
  }
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    return next();
  }
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    try {
      req.user = jwt.verify(parts[1], JWT_SECRET);
    } catch (err) {
      // Ignore invalid optional token
    }
  }
  next();
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to view this resource.' });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  optionalToken,
  requireRole,
  JWT_SECRET
};

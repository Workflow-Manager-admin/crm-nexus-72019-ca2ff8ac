const authService = require('../services/auth');

/**
 * Express middleware to enforce JWT authentication for protected endpoints.
 * Attaches `req.user` to downstream handlers.
 */
function authenticateJWT(req, res, next) {
  // Look for bearer token
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = authService.verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateJWT;

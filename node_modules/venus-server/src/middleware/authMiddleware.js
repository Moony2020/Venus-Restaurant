import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const cookieToken = req.cookies?.venus_auth;
    const token = bearerToken || cookieToken;

    if (!token) return res.status(401).json({ message: 'No token' });

    const secret = process.env.JWT_SECRET || process.env.COOKIE_SECRET;
    const decoded = jwt.verify(token, secret);
    const userId = decoded.id || decoded.userId;

    req.user = await User.findById(userId).select('-password');

    if (!req.user) return res.status(401).json({ message: 'Invalid token user' });
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return next();
};

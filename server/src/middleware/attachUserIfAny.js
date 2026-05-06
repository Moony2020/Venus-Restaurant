import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const attachUserIfAny = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.venus_auth;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || process.env.COOKIE_SECRET);
    const userId = payload.id || payload.userId;
    const user = await User.findById(userId).select('-password');
    if (user) req.user = user;
  } catch {
    // ignore invalid optional session
  }

  return next();
};

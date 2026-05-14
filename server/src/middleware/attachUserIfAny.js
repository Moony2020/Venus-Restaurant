import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../lib/auth.js';

export const attachUserIfAny = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = req.cookies?.venus_auth || bearerToken;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const userId = payload.userId;
    const user = await User.findById(userId).select('-password');
    if (user) req.user = user;
  } catch {
    // ignore invalid optional session
  }

  return next();
};

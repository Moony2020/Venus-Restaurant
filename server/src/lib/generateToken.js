import jwt from 'jsonwebtoken';
import { getJwtSecret } from './auth.js';

export const generateToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, getJwtSecret(), { expiresIn: '24h' });
};

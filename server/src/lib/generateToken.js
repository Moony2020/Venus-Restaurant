import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || process.env.COOKIE_SECRET;
  return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
};

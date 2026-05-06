import User from '../models/User.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../lib/auth.js';
import { generateToken } from '../lib/generateToken.js';

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const user = await User.create({ fullName, email, password });
  const cookieToken = signAuthToken(user._id.toString());
  setAuthCookie(res, cookieToken);
  const token = generateToken(user);

  res.status(201).json({
    token,
    user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const cookieToken = signAuthToken(user._id.toString());
  setAuthCookie(res, cookieToken);
  const token = generateToken(user);

  return res.json({
    token,
    user: { _id: user._id, fullName: user.fullName, email: user.email, role: user.role }
  });
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  const valid = await user.comparePassword(currentPassword);
  if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });

  user.password = newPassword;
  await user.save();

  return res.json({ message: 'Password updated successfully' });
};

import User from '../models/User.js';
import { clearAuthCookie, setAuthCookie, signAuthToken } from '../lib/auth.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../lib/mailer.js';

export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already in use' });

  const user = await User.create({ fullName, email, password });
  const cookieToken = signAuthToken(user._id.toString());
  setAuthCookie(res, cookieToken);

  res.status(201).json({
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

  return res.json({
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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const isDev = process.env.NODE_ENV !== 'production';
  let debug = { userFound: false, emailSent: false, resetUrl: null };

  const user = await User.findOne({ email: normalizedEmail });
  if (user) {
    debug.userFound = true;
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await user.save({ validateBeforeSave: false });

    const appBaseUrl = process.env.PUBLIC_APP_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const resetUrl = `${appBaseUrl}/reset-password/${rawToken}`;
    const mailResult = await sendPasswordResetEmail(user, resetUrl);
    debug.emailSent = Boolean(mailResult?.deliveredToSmtp);
    debug.mail = mailResult;
    debug.resetUrl = resetUrl;
  }

  if (isDev) {
    console.log(`[auth] forgot-password requested for ${normalizedEmail} | userFound=${debug.userFound} | emailSent=${debug.emailSent}`);
    if (debug.resetUrl) {
      console.log(`[auth] reset link (dev): ${debug.resetUrl}`);
    }
  }

  const payload = { message: 'If this email exists, a reset link has been sent.' };
  if (isDev) payload.debug = debug;
  return res.json(payload);
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res.json({ message: 'Password reset successfully. You can now sign in.' });
};

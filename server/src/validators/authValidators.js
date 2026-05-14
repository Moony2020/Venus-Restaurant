const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const isStrongPassword = (value) => typeof value === 'string' && PASSWORD_REGEX.test(value);

export const validateRegister = (req, res, next) => {
  const { fullName, email, password } = req.body;
  if (!fullName || typeof fullName !== 'string') return res.status(400).json({ message: 'fullName is required' });
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) return res.status(400).json({ message: 'valid email is required' });
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'password must be at least 8 chars and include uppercase, lowercase, number, and symbol' });
  }
  return next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  return next();
};

export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || typeof currentPassword !== 'string') {
    return res.status(400).json({ message: 'currentPassword is required' });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ message: 'newPassword must be at least 8 chars and include uppercase, lowercase, number, and symbol' });
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'new password must be different from current password' });
  }
  return next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'valid email is required' });
  }
  return next();
};

export const validateResetPassword = (req, res, next) => {
  const { token, newPassword } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'token is required' });
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({ message: 'newPassword must be at least 8 chars and include uppercase, lowercase, number, and symbol' });
  }
  return next();
};

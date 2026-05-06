import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'venus_auth';
const getJwtSecret = () => process.env.JWT_SECRET || process.env.COOKIE_SECRET;

export const signAuthToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME);
};

export const getAuthCookieName = () => COOKIE_NAME;

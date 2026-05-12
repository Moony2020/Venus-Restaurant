import { recordError } from '../lib/metrics.js';

export const notFound = (req, res, _next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const ts = new Date().toISOString();
  const endpoint = _req?.originalUrl || _req?.url || 'unknown-endpoint';
  recordError();
  console.error(`[${ts}] API_ERROR ${_req?.method || 'UNKNOWN'} ${endpoint}: ${err.message}`);
  if (status === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({ message });
};

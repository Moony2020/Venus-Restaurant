const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const MAX_RETRIES = 2;
const RETRYABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryStatus = (status) => status === 429 || status >= 500;

const friendlyMessage = (status, fallback = '') => {
  if (status === 401) return 'Your session expired. Please sign in again.';
  if (status === 403) return 'You do not have permission for this action.';
  if (status === 404) return 'The requested resource could not be found.';
  if (status === 429) return 'Too many requests. Please try again in a moment.';
  if (status >= 500) return 'Something went wrong, try again.';
  return fallback || 'Something went wrong, try again.';
};

const parseErrorMessage = async (res) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || '';
  } catch {
    return '';
  }
};

const request = async (path, config = {}, attempt = 0) => {
  const method = String(config.method || 'GET').toUpperCase();
  const canRetry = RETRYABLE_METHODS.has(method);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...config
    });

    if (!res.ok) {
      const backendMessage = await parseErrorMessage(res);

      if (canRetry && attempt < MAX_RETRIES && shouldRetryStatus(res.status)) {
        const backoffMs = attempt === 0 ? 500 : 1500;
        await sleep(backoffMs);
        return request(path, config, attempt + 1);
      }

      const error = new Error(friendlyMessage(res.status, backendMessage));
      error.status = res.status;
      throw error;
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    const isNetworkError = !Object.prototype.hasOwnProperty.call(error, 'status');
    if (canRetry && attempt < MAX_RETRIES && isNetworkError) {
      const backoffMs = attempt === 0 ? 500 : 1500;
      await sleep(backoffMs);
      return request(path, config, attempt + 1);
    }

    if (isNetworkError) {
      throw new Error('Could not connect to server. Please try again.');
    }

    throw error;
  }
};

export async function apiGet(path, options = {}) {
  return request(path, {
    method: 'GET',
    headers: options.headers || {}
  });
}

export async function apiPost(path, payload, options = {}) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(payload)
  });
}

export async function apiPatch(path, payload, options = {}) {
  return request(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(payload)
  });
}

export async function apiDelete(path, options = {}) {
  return request(path, {
    method: 'DELETE',
    headers: options.headers || {}
  });
}

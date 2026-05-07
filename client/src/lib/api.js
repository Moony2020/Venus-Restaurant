const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export async function apiGet(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.headers || {},
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, payload, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiPatch(path, payload, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export async function apiDelete(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: options.headers || {}
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

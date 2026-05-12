const store = new Map();

export const getCache = (key) => {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

export const setCache = (key, value, ttlMs) => {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
};

export const clearCacheByPrefix = (prefix) => {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
};

export const clearCacheKey = (key) => {
  store.delete(key);
};


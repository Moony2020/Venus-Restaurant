import { useEffect, useMemo, useState } from 'react';
import { io as createSocket } from 'socket.io-client';
import { apiGet } from '../lib/api';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const useRestaurantStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const result = await apiGet('/restaurant/status');
        if (!active) return;
        setData(result);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();

    const socket = createSocket(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true
    });
    socket.on('restaurant:updated', (payload) => {
      if (!active) return;
      setData({
        week: payload?.settings?.week || data?.week,
        manualOverride: payload?.settings?.manualOverride || 'none',
        manualMessage: payload?.settings?.manualMessage || '',
        nowStatus: payload?.nowStatus || data?.nowStatus
      });
    });

    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  return useMemo(() => ({ data, loading }), [data, loading]);
};



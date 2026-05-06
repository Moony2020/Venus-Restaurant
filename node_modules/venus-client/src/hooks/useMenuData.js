import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export const useMenuData = () => {
  const [items, setItems] = useState([]);
  const [lunch, setLunch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [menuData, lunchData] = await Promise.all([
          apiGet('/menu'),
          apiGet('/menu/lunch-of-the-day')
        ]);

        if (!active) return;
        setItems(menuData);
        setLunch(lunchData);
      } catch {
        if (!active) return;
        setError('Kunde inte ladda menyn just nu.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { items, lunch, loading, error };
};

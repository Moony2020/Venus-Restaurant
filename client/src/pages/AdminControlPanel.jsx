import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminHeader from '../layout/AdminHeader';
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';

const CATEGORY_OPTIONS = [
  'popular',
  'starters',
  'pizza-class-1',
  'pizza-class-2',
  'pizza-class-3',
  'pizza-class-4',
  'special-pizzas',
  'oxfilepizzor',
  'kebabratter',
  'a-la-carte',
  'others',
  'sallader',
  'saser',
  'drinks',
  'burgers',
  'desserts'
];

const EMPTY_PRODUCT = {
  name: '',
  description: '',
  image: '',
  category: 'popular',
  price: ''
};

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_HOURS = {
  monday: { open: '11:00', close: '22:00', closed: false },
  tuesday: { open: '11:00', close: '22:00', closed: false },
  wednesday: { open: '11:00', close: '22:00', closed: false },
  thursday: { open: '11:00', close: '22:00', closed: false },
  friday: { open: '11:00', close: '24:00', closed: false },
  saturday: { open: '12:00', close: '24:00', closed: false },
  sunday: { open: '12:00', close: '22:00', closed: false }
};

const getTodayKeyInStockholm = () => {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    weekday: 'long'
  }).format(new Date()).toLowerCase();

  return WEEK_DAYS.includes(weekday) ? weekday : null;
};

const timeToMinutes = (value) => {
  const normalized = String(value || '').trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
  if (hours === 24 && minutes > 0) hours = 0;
  return hours * 60 + minutes;
};

const normalizeTimeInput = (value) => {
  const raw = String(value || '').trim().replace('.', ':');
  const match = raw.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return value;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  if (h < 0 || h > 24 || m < 0 || m > 59) return value;
  if (h === 24 && m !== 0) return value;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const AdminControlPanel = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [createForm, setCreateForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState('');
  const [editingForm, setEditingForm] = useState(EMPTY_PRODUCT);
  const [settings, setSettings] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [needForm, setNeedForm] = useState({ name: '', status: 'ok', note: '' });
  const [draggingId, setDraggingId] = useState('');

  const loadAll = async () => {
    const now = Date.now();
    const [menuData, settingsData, needsData] = await Promise.all([
      apiGet(`/menu?includeUnavailable=true&t=${now}`),
      apiGet(`/restaurant/settings?t=${now}`),
      apiGet(`/restaurant/needs?t=${now}`)
    ]);
    setProducts(menuData || []);
    setSettings(settingsData || null);
    setNeeds(needsData || []);
  };

  useEffect(() => {
    loadAll().catch(() => toast.error('Could not load admin control data'));
  }, []);

  const categoryItems = useMemo(
    () =>
      [...products]
        .filter((item) => item.category === selectedCategory)
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    [products, selectedCategory]
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    await apiPost('/menu', { ...createForm, price: Number(createForm.price) || 0 });
    setCreateForm({ ...EMPTY_PRODUCT, category: selectedCategory });
    toast.success('Product added');
    await loadAll();
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditingForm({
      name: item.name || '',
      description: item.description || '',
      image: item.image || '',
      category: item.category || 'popular',
      price: item.price || ''
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await apiPatch(`/menu/${editingId}`, { ...editingForm, price: Number(editingForm.price) || 0 });
    setEditingId('');
    toast.success('Product updated');
    await loadAll();
  };

  const toggleAvailability = async (item) => {
    await apiPatch(`/menu/${item._id}/availability`, { available: !item.available });
    await loadAll();
  };

  const removeProduct = async (id) => {
    await apiDelete(`/menu/${id}`);
    toast.success('Product deleted');
    await loadAll();
  };

  const onDropItem = async (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const ordered = [...categoryItems];
    const from = ordered.findIndex((x) => x._id === draggingId);
    const to = ordered.findIndex((x) => x._id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const itemIds = ordered.map((x) => x._id);
    setDraggingId('');
    await apiPatch('/menu/reorder', { category: selectedCategory, itemIds });
    await loadAll();
  };

  const updateDay = (day, key, value) => {
    setSettings((prev) => {
      const newDaySettings = { ...prev.week[day], [key]: value };

      // If user edits hours, that day should follow hours (not full-day closed)
      if (key === 'open' || key === 'close') {
        newDaySettings.closed = false;
      }
      
      // If unchecking 'closed', reset this specific day to default hours
      if (key === 'closed' && value === false) {
        newDaySettings.open = DEFAULT_HOURS[day].open;
        newDaySettings.close = DEFAULT_HOURS[day].close;
      }
      
      return {
        ...prev,
        week: {
          ...prev.week,
          [day]: newDaySettings
        }
      };
    });
  };

  const currentStatus = useMemo(() => {
    if (!settings) return { isOpen: false, text: 'Laddar...' };
    
    // 1. Check manual overrides first
    if (settings.manualOverride === 'force_open') return { isOpen: true, text: 'Tvingad ÖPPEN' };
    if (settings.manualOverride === 'force_closed') return { isOpen: false, text: 'Tvingad STÄNGD' };

    // 2. Setup current time in Stockholm
    const nowStockholm = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).format(new Date());
    const nowMinutes = timeToMinutes(nowStockholm);

    const checkDay = (dayKey, isYesterday = false) => {
      const daySettings = settings.week?.[dayKey];
      if (!daySettings || daySettings.closed) return null;

      const openMin = timeToMinutes(daySettings.open);
      let closeMin = timeToMinutes(daySettings.close);
      if (daySettings.close === '00:00' || daySettings.close === '24:00' || closeMin === 0) closeMin = 1440;

      const isRollover = closeMin < openMin;

      if (isYesterday) {
        return isRollover && nowMinutes < closeMin;
      } else {
        if (isRollover) return nowMinutes >= openMin || nowMinutes < closeMin;
        return nowMinutes >= openMin && nowMinutes < closeMin;
      }
    };

    const todayKey = getTodayKeyInStockholm();
    const todayIdx = WEEK_DAYS.indexOf(todayKey);
    const yesterdayKey = WEEK_DAYS[(todayIdx - 1 + 7) % 7];

    // Check yesterday's rollover first
    if (checkDay(yesterdayKey, true)) {
      const sched = settings.week?.[yesterdayKey];
      return { isOpen: true, text: `Öppet nu (från igår) • Stänger kl ${sched.close}` };
    }

    // Check today's schedule
    if (checkDay(todayKey)) {
      const sched = settings.week?.[todayKey];
      return { isOpen: true, text: `Öppet nu • Stänger kl ${sched.close}` };
    }

    return { 
      isOpen: false, 
      text: 'Schema: STÄNGT just nu' 
    };
  }, [settings]);

  const saveHours = async (newOverride = undefined) => {
    try {
      let manualOverride = newOverride !== undefined ? newOverride : settings.manualOverride;
      let weekPayload = JSON.parse(JSON.stringify(settings.week));

      // "Return to Schedule" logic: Reset everything to defaults
      if (newOverride === 'none') {
        weekPayload = JSON.parse(JSON.stringify(DEFAULT_HOURS));
        manualOverride = 'none';
      }

      // Safety: if a day is NOT checked as closed, make sure closed=false is explicit
      // If a day IS checked as closed, ensure closed=true
      for (const day of WEEK_DAYS) {
        if (weekPayload[day]) {
          weekPayload[day].closed = Boolean(weekPayload[day].closed);
        }
      }
      
      const payload = {
        week: weekPayload,
        manualOverride,
        manualMessage: settings.manualMessage
      };

      const updated = await apiPatch('/restaurant/settings', payload);
      setSettings(updated || settings);
      
      if (newOverride !== undefined) {
        toast.success(newOverride === 'none' ? 'Återställt till normalt schema' : 'Status uppdaterad', { icon: '⚡' });
      } else {
        toast.success('Inställningar sparade');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Kunde inte spara inställningarna');
    }
  };

  const addNeed = async (e) => {
    e.preventDefault();
    await apiPost('/restaurant/needs', needForm);
    setNeedForm({ name: '', status: 'ok', note: '' });
    await loadAll();
  };

  const updateNeedStatus = async (id, status) => {
    await apiPatch(`/restaurant/needs/${id}`, { status });
    await loadAll();
  };

  const removeNeed = async (id) => {
    await apiDelete(`/restaurant/needs/${id}`);
    toast.success('Behov borttaget');
    await loadAll();
  };

  return (
    <>
      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(72%) sepia(35%) saturate(750%) hue-rotate(5deg) brightness(95%) contrast(90%);
          cursor: pointer;
        }
      `}</style>
      <main className="min-h-screen bg-background text-white pb-20">
      <AdminHeader />
      <section className="mx-auto max-w-[1600px] px-6 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold mb-1">Admin Portal</p>
            <h1 className="font-display text-4xl sm:text-5xl">Översikt</h1>
            <p className="text-white/40 text-sm mt-2">Hantera restaurangens status, lagerbehov och menyinställningar.</p>
          </div>

          {settings && (
            <div className="flex items-center gap-4 bg-panel/40 border border-white/10 rounded-2xl p-4 pr-6 backdrop-blur-md shadow-2xl">
              <div className={`h-3 w-3 rounded-full shadow-[0_0_12px] ${currentStatus.isOpen ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'} animate-pulse`} />
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-0.5">Live Status</p>
                <p className={`text-[11px] font-black uppercase tracking-widest ${currentStatus.isOpen ? 'text-green-400' : 'text-red-400'}`}>
                  {currentStatus.isOpen ? 'ÖPPET' : 'STÄNGT'}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div>
                <p className="text-[8px] uppercase tracking-widest text-white/30 mb-0.5">Operativ Mode</p>
                <p className="text-[11px] font-bold text-white/80">{currentStatus.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Controls Section */}
        {settings && (
          <div className="mb-12 rounded-2xl border border-white/10 bg-panel/30 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Activity size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-xl text-gold mb-6 uppercase tracking-widest">Restaurangens Drift</h2>
              <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                <div className="space-y-4">
                  <p className="text-xs text-white/50 leading-relaxed">Använd snabbknapparna för att omedelbart ändra restaurangens status oavsett schema.</p>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => saveHours('force_closed')}
                      className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${settings.manualOverride === 'force_closed' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'}`}
                    >
                      Stäng Omedelbart
                    </button>
                    <button 
                      onClick={() => saveHours('force_open')}
                      className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${settings.manualOverride === 'force_open' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white'}`}
                    >
                      Tvinga Öppet
                    </button>
                    <button 
                      onClick={() => saveHours('none')}
                      className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${settings.manualOverride === 'none' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-white/5 border border-white/10 text-white/40 hover:border-gold hover:text-gold'}`}
                    >
                      Återgå till schema
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Manuellt meddelande till kunder</label>
                    <div className="flex gap-3">
                      <input 
                        className="flex-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                        placeholder="t.ex. 'Stängt pga renovering' eller 'Oväntad personalbrist'" 
                        value={settings.manualMessage || ''} 
                        onChange={(e) => setSettings((p) => ({ ...p, manualMessage: e.target.value }))} 
                      />
                      <button 
                        onClick={() => saveHours()}
                        className="px-6 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:border-gold hover:text-gold transition-all"
                      >
                        Spara meddelande
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Add Product Section */}
          <div className="rounded-2xl border border-white/10 bg-panel/30 p-8 shadow-xl">
            <h2 className="font-display text-xl text-gold mb-6 uppercase tracking-widest">Lägg till produkt</h2>
            <form className="grid gap-4" onSubmit={handleCreate}>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Produktnamn</label>
                <input 
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                  placeholder="t.ex. Margherita" 
                  value={createForm.name} 
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Beskrivning</label>
                <textarea 
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors min-h-[100px]" 
                  placeholder="Tomatsås, ost..." 
                  value={createForm.description} 
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Bild-URL</label>
                <input 
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                  placeholder="/images/menu-pizza.png" 
                  value={createForm.image} 
                  onChange={(e) => setCreateForm((p) => ({ ...p, image: e.target.value }))} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Kategori</label>
                  <select 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat" 
                    value={createForm.category} 
                    onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat} className="bg-[#0a0a0b]">{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Pris (kr)</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                    placeholder="135" 
                    value={createForm.price} 
                    onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))} 
                    required 
                  />
                </div>
              </div>
              <button className="mt-2 w-full rounded-lg bg-gold py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10">
                Spara produkt
              </button>
            </form>
          </div>

          {/* Needs List Section */}
          <div className="rounded-2xl border border-white/10 bg-panel/30 p-8 shadow-xl flex flex-col">
            <h2 className="font-display text-xl text-gold mb-6 uppercase tracking-widest">Inköpslista</h2>
            <form className="grid gap-4" onSubmit={addNeed}>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Vara</label>
                <input 
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                  placeholder="Ost, Kyckling, Cola..." 
                  value={needForm.name} 
                  onChange={(e) => setNeedForm((p) => ({ ...p, name: e.target.value }))} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Status</label>
                  <select 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat" 
                    value={needForm.status} 
                    onChange={(e) => setNeedForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    <option value="ok" className="bg-[#0a0a0b]">OK</option>
                    <option value="need_soon" className="bg-[#0a0a0b]">Behövs snart</option>
                    <option value="urgent" className="bg-[#0a0a0b]">Akut</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Notering</label>
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                    placeholder="Valfri notering" 
                    value={needForm.note} 
                    onChange={(e) => setNeedForm((p) => ({ ...p, note: e.target.value }))} 
                  />
                </div>
              </div>
              <button className="mt-2 w-full rounded-lg bg-gold py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10">
                Lägg till behov
              </button>
            </form>
            
            <div className="mt-8 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {needs.map((need) => (
                <div key={need._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
                  <div>
                    <p className="font-medium text-sm">{need.name}</p>
                    {need.note && <p className="text-[10px] text-white/40 italic mt-1">"{need.note}"</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className={`rounded-lg border px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest outline-none transition-all ${
                        need.status === 'urgent' ? 'border-red-500/40 bg-red-500/10 text-red-400' :
                        need.status === 'need_soon' ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' :
                        'border-white/10 bg-white/5 text-white/40'
                      }`}
                      value={need.status}
                      onChange={(e) => updateNeedStatus(need._id, e.target.value)}
                    >
                      <option value="ok" className="bg-[#0a0a0b]">OK</option>
                      <option value="need_soon" className="bg-[#0a0a0b]">Väntar</option>
                      <option value="urgent" className="bg-[#0a0a0b]">AKUT</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeNeed(need._id)}
                      className="rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-red-300 transition-all hover:bg-red-500/20"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opening Hours Section */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-panel/30 p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl text-gold uppercase tracking-widest">Öppettider</h2>
            <button 
              className={`rounded-lg px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all shadow-lg ${
                !settings ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-gold hover:bg-goldSoft shadow-gold/10'
              }`} 
              onClick={() => saveHours()}
              disabled={!settings}
            >
              Spara schema
            </button>
          </div>
          
          {settings && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className={`rounded-xl border p-4 transition-all ${settings.week?.[day]?.closed ? 'border-red-500/20 bg-red-500/5 opacity-60' : 'border-white/5 bg-white/[0.02]'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-3">{day === 'monday' ? 'Måndag' : day === 'tuesday' ? 'Tisdag' : day === 'wednesday' ? 'Onsdag' : day === 'thursday' ? 'Torsdag' : day === 'friday' ? 'Fredag' : day === 'saturday' ? 'Lördag' : 'Söndag'}</p>
                    <div className="space-y-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-widest text-white/20">Öppnar</span>
                        <input 
                          type="text" 
                          value={settings.week?.[day]?.open || '11:00'} 
                          onChange={(e) => updateDay(day, 'open', e.target.value)} 
                          onBlur={(e) => updateDay(day, 'open', normalizeTimeInput(e.target.value))}
                          disabled={Boolean(settings.week?.[day]?.closed)}
                          className={`w-full bg-transparent border-b border-white/10 py-1 text-xs outline-none focus:border-gold placeholder:text-white/10 ${settings.week?.[day]?.closed ? 'text-white/20 cursor-not-allowed' : 'text-white'}`}
                          placeholder="11:00"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-widest text-white/20">Stänger</span>
                        <input 
                          type="text" 
                          value={settings.week?.[day]?.close || '22:00'} 
                          onChange={(e) => updateDay(day, 'close', e.target.value)} 
                          onBlur={(e) => updateDay(day, 'close', normalizeTimeInput(e.target.value))}
                          disabled={Boolean(settings.week?.[day]?.closed)}
                          className={`w-full bg-transparent border-b border-white/10 py-1 text-xs outline-none focus:border-gold placeholder:text-white/10 ${settings.week?.[day]?.closed ? 'text-white/20 cursor-not-allowed' : 'text-white'}`}
                          placeholder="22:00"
                        />
                      </div>
                    </div>
                    <label className="mt-4 flex items-center justify-between gap-2 cursor-pointer group">
                      <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-red-400 transition-colors">Stängt hela dagen</span>
                      <input 
                        type="checkbox" 
                        className="accent-gold"
                        checked={Boolean(settings.week?.[day]?.closed)} 
                        onChange={(e) => updateDay(day, 'closed', e.target.checked)} 
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_2fr] border-t border-white/10 pt-8">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Status Override</label>
                  <select 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat" 
                    value={settings.manualOverride || 'none'} 
                    onChange={(e) => setSettings((p) => ({ ...p, manualOverride: e.target.value }))}
                  >
                    <option value="none" className="bg-[#0a0a0b]">Följ schema</option>
                    <option value="force_open" className="bg-[#0a0a0b]">Tvinga ÖPPET</option>
                    <option value="force_closed" className="bg-[#0a0a0b]">Tvinga STÄNGT</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Manuellt meddelande (valfritt)</label>
                  <input 
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" 
                    placeholder="t.ex. 'Stängt pga renovering'" 
                    value={settings.manualMessage || ''} 
                    onChange={(e) => setSettings((p) => ({ ...p, manualMessage: e.target.value }))} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Menu Management Section */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-panel/30 p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <h2 className="font-display text-xl text-gold uppercase tracking-widest">Menyhantering</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Kategori:</span>
              <select 
                className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gold outline-none focus:border-gold transition-all appearance-none pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23c8a44d%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_12px_center] bg-no-repeat" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat} className="bg-[#0a0a0b]">{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {categoryItems.map((item) => (
              <div
                key={item._id}
                draggable
                onDragStart={() => setDraggingId(item._id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropItem(item._id)}
                className="grid items-center gap-6 rounded-xl border border-white/5 bg-white/[0.02] p-5 transition-all hover:border-gold/30 hover:bg-white/[0.04] group md:grid-cols-[1fr_100px_140px_180px]"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-white/5 flex items-center justify-center text-white/20 cursor-move">⋮⋮</div>
                  <div>
                    <p className="font-medium text-white/90 group-hover:text-gold transition-colors">{item.name}</p>
                    <p className="text-[10px] text-white/40 line-clamp-1">{item.description}</p>
                  </div>
                </div>
                <p className="font-bold text-gold text-sm">{item.price} kr</p>
                <button
                  className={`rounded-full border px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all ${
                    item.available ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-red-500/40 bg-red-500/10 text-red-400'
                  }`}
                  onClick={() => toggleAvailability(item)}
                >
                  {item.available ? 'Tillgänglig' : 'Ej tillgänglig'}
                </button>
                <div className="flex justify-end gap-2">
                  <button 
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:border-gold hover:text-gold transition-all" 
                    onClick={() => startEdit(item)}
                  >
                    Redigera
                  </button>
                  <button 
                    className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-red-400/40 hover:bg-red-500 hover:text-white transition-all" 
                    onClick={() => removeProduct(item._id)}
                  >
                    Radera
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingId('')} />
              <div className="relative w-full max-w-xl rounded-2xl border border-gold/30 bg-[#0e0e11] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
                <h3 className="font-display text-2xl text-gold mb-6 uppercase tracking-widest">Redigera produkt</h3>
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Namn</label>
                    <input className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" value={editingForm.name} onChange={(e) => setEditingForm((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Beskrivning</label>
                    <textarea className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors min-h-[80px]" value={editingForm.description} onChange={(e) => setEditingForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Bild-URL</label>
                    <input className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" value={editingForm.image} onChange={(e) => setEditingForm((p) => ({ ...p, image: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Kategori</label>
                      <select className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat" value={editingForm.category} onChange={(e) => setEditingForm((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat} className="bg-[#0a0a0b]">{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-widest text-white/30 ml-1">Pris (kr)</label>
                      <input type="number" className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors" value={editingForm.price} onChange={(e) => setEditingForm((p) => ({ ...p, price: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button className="flex-1 rounded-lg bg-gold py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-xl shadow-gold/10" onClick={saveEdit}>Spara ändringar</button>
                    <button className="flex-1 rounded-lg bg-white/5 border border-white/10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all" onClick={() => setEditingId('')}>Avbryt</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
    </>
  );
};

export default AdminControlPanel;

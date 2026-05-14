import { useEffect, useMemo, useState } from 'react';
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
    const [menuData, settingsData, needsData] = await Promise.all([
      apiGet('/menu?includeUnavailable=true'),
      apiGet('/restaurant/settings'),
      apiGet('/restaurant/needs')
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
    setSettings((prev) => ({
      ...prev,
      week: {
        ...prev.week,
        [day]: { ...prev.week[day], [key]: value }
      }
    }));
  };

  const saveHours = async () => {
    await apiPatch('/restaurant/settings', {
      week: settings.week,
      manualOverride: settings.manualOverride,
      manualMessage: settings.manualMessage
    });
    toast.success('Opening hours updated');
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
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold mb-1">Admin Portal</p>
          <h1 className="font-display text-4xl sm:text-5xl">Översikt</h1>
          <p className="text-white/40 text-sm mt-2">Hantera restaurangens status, lagerbehov och menyinställningar.</p>
        </div>

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
              className="rounded-lg bg-gold px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-goldSoft transition-all shadow-lg shadow-gold/10" 
              onClick={saveHours}
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
                          type="time" 
                          value={settings.week?.[day]?.open || '10:00'} 
                          onChange={(e) => updateDay(day, 'open', e.target.value)} 
                          className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold [color-scheme:dark]" 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] uppercase tracking-widest text-white/20">Stänger</span>
                        <input 
                          type="time" 
                          value={settings.week?.[day]?.close || '22:00'} 
                          onChange={(e) => updateDay(day, 'close', e.target.value)} 
                          className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-gold [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                    <label className="mt-4 flex items-center justify-between gap-2 cursor-pointer group">
                      <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-red-400 transition-colors">Stängt</span>
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

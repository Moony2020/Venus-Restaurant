import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import AdminHeader from '../layout/AdminHeader';
import { useAuth } from '../context/AuthContext';
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
  const { token } = useAuth();
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

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
      apiGet('/menu?includeUnavailable=true', { headers: authHeaders }),
      apiGet('/restaurant/settings', { headers: authHeaders }),
      apiGet('/restaurant/needs', { headers: authHeaders })
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
    await apiPost(
      '/menu',
      { ...createForm, price: Number(createForm.price) || 0 },
      { headers: authHeaders }
    );
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
    await apiPatch(
      `/menu/${editingId}`,
      { ...editingForm, price: Number(editingForm.price) || 0 },
      { headers: authHeaders }
    );
    setEditingId('');
    toast.success('Product updated');
    await loadAll();
  };

  const toggleAvailability = async (item) => {
    await apiPatch(
      `/menu/${item._id}/availability`,
      { available: !item.available },
      { headers: authHeaders }
    );
    await loadAll();
  };

  const removeProduct = async (id) => {
    await apiDelete(`/menu/${id}`, { headers: authHeaders });
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
    await apiPatch('/menu/reorder', { category: selectedCategory, itemIds }, { headers: authHeaders });
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
    await apiPatch(
      '/restaurant/settings',
      {
        week: settings.week,
        manualOverride: settings.manualOverride,
        manualMessage: settings.manualMessage
      },
      { headers: authHeaders }
    );
    toast.success('Opening hours updated');
  };

  const addNeed = async (e) => {
    e.preventDefault();
    await apiPost('/restaurant/needs', needForm, { headers: authHeaders });
    setNeedForm({ name: '', status: 'ok', note: '' });
    await loadAll();
  };

  const updateNeedStatus = async (id, status) => {
    await apiPatch(`/restaurant/needs/${id}`, { status }, { headers: authHeaders });
    await loadAll();
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <AdminHeader />
      <section className="mx-auto max-w-[1600px] px-6 py-8">
        <h1 className="font-display text-5xl">Restaurant Control Panel</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div className="border border-white/10 bg-panel p-5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold">Add Product</h2>
            <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
              <input className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} required />
              <textarea className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Description" value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} required />
              <input className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Image URL" value={createForm.image} onChange={(e) => setCreateForm((p) => ({ ...p, image: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-3">
                <select className="border border-white/10 bg-black/30 px-3 py-2" value={createForm.category} onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="number" className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Price" value={createForm.price} onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))} required />
              </div>
              <button className="border border-gold bg-gold px-4 py-2 text-black">Add Product</button>
            </form>
          </div>

          <div className="border border-white/10 bg-panel p-5">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold">Needs List</h2>
            <form className="mt-4 grid gap-3" onSubmit={addNeed}>
              <input className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Cheese, Chicken, Cola..." value={needForm.name} onChange={(e) => setNeedForm((p) => ({ ...p, name: e.target.value }))} required />
              <select className="border border-white/10 bg-black/30 px-3 py-2" value={needForm.status} onChange={(e) => setNeedForm((p) => ({ ...p, status: e.target.value }))}>
                <option value="ok">OK</option>
                <option value="need_soon">Need soon</option>
                <option value="urgent">Urgent</option>
              </select>
              <input className="border border-white/10 bg-black/30 px-3 py-2" placeholder="Optional note" value={needForm.note} onChange={(e) => setNeedForm((p) => ({ ...p, note: e.target.value }))} />
              <button className="border border-gold bg-gold px-4 py-2 text-black">Add Need</button>
            </form>
            <div className="mt-4 space-y-2">
              {needs.map((need) => (
                <div key={need._id} className="flex items-center justify-between border border-white/10 p-2">
                  <div>
                    <p>{need.name}</p>
                    <p className="text-xs text-white/50">{need.note}</p>
                  </div>
                  <select
                    className="border border-white/10 bg-black/30 px-2 py-1 text-xs"
                    value={need.status}
                    onChange={(e) => updateNeedStatus(need._id, e.target.value)}
                  >
                    <option value="ok">OK</option>
                    <option value="need_soon">Need soon</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border border-white/10 bg-panel p-5">
          <h2 className="text-xs uppercase tracking-[0.18em] text-gold">Opening Hours</h2>
          {settings && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="border border-white/10 p-3">
                    <p className="mb-2 capitalize">{day}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={settings.week?.[day]?.open || '10:00'} onChange={(e) => updateDay(day, 'open', e.target.value)} className="border border-white/10 bg-black/30 px-2 py-1" />
                      <input type="time" value={settings.week?.[day]?.close || '23:00'} onChange={(e) => updateDay(day, 'close', e.target.value)} className="border border-white/10 bg-black/30 px-2 py-1" />
                    </div>
                    <label className="mt-2 flex items-center gap-2 text-xs text-white/70">
                      <input type="checkbox" checked={Boolean(settings.week?.[day]?.closed)} onChange={(e) => updateDay(day, 'closed', e.target.checked)} />
                      Closed
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <select className="border border-white/10 bg-black/30 px-3 py-2" value={settings.manualOverride || 'none'} onChange={(e) => setSettings((p) => ({ ...p, manualOverride: e.target.value }))}>
                  <option value="none">Normal schedule</option>
                  <option value="force_open">Force open</option>
                  <option value="force_closed">Force closed</option>
                </select>
                <input className="border border-white/10 bg-black/30 px-3 py-2 md:col-span-2" placeholder="Manual message (optional)" value={settings.manualMessage || ''} onChange={(e) => setSettings((p) => ({ ...p, manualMessage: e.target.value }))} />
              </div>
              <button className="mt-3 border border-gold bg-gold px-4 py-2 text-black" onClick={saveHours}>Save Hours</button>
            </>
          )}
        </div>

        <div className="mt-8 border border-white/10 bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs uppercase tracking-[0.18em] text-gold">Menu Management + Reorder</h2>
            <select className="border border-white/10 bg-black/30 px-3 py-2" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="mt-4 space-y-3">
            {categoryItems.map((item) => (
              <div
                key={item._id}
                draggable
                onDragStart={() => setDraggingId(item._id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropItem(item._id)}
                className="grid items-center gap-3 border border-white/10 p-3 md:grid-cols-[1fr_120px_120px_220px]"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-white/55">{item.description}</p>
                </div>
                <p>{item.price} SEK</p>
                <button
                  className={`border px-2 py-1 text-xs ${item.available ? 'border-green-400/40 text-green-300' : 'border-red-400/40 text-red-300'}`}
                  onClick={() => toggleAvailability(item)}
                >
                  {item.available ? 'Available' : 'Unavailable'}
                </button>
                <div className="flex gap-2">
                  <button className="border border-white/20 px-2 py-1 text-xs" onClick={() => startEdit(item)}>Edit</button>
                  <button className="border border-red-400/40 px-2 py-1 text-xs text-red-300" onClick={() => removeProduct(item._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {editingId && (
            <div className="mt-4 border border-gold/30 p-4">
              <h3 className="text-sm uppercase tracking-[0.14em] text-gold">Edit Product</h3>
              <div className="mt-3 grid gap-2">
                <input className="border border-white/10 bg-black/30 px-3 py-2" value={editingForm.name} onChange={(e) => setEditingForm((p) => ({ ...p, name: e.target.value }))} />
                <textarea className="border border-white/10 bg-black/30 px-3 py-2" value={editingForm.description} onChange={(e) => setEditingForm((p) => ({ ...p, description: e.target.value }))} />
                <input className="border border-white/10 bg-black/30 px-3 py-2" value={editingForm.image} onChange={(e) => setEditingForm((p) => ({ ...p, image: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select className="border border-white/10 bg-black/30 px-3 py-2" value={editingForm.category} onChange={(e) => setEditingForm((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="number" className="border border-white/10 bg-black/30 px-3 py-2" value={editingForm.price} onChange={(e) => setEditingForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button className="border border-gold bg-gold px-4 py-2 text-black" onClick={saveEdit}>Save</button>
                  <button className="border border-white/20 px-4 py-2" onClick={() => setEditingId('')}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminControlPanel;


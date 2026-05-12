import MenuItem, { normalizeCategory } from '../models/MenuItem.js';
import { getIO } from '../lib/socket.js';
import { clearCacheByPrefix, getCache, setCache } from '../lib/cache.js';

const MENU_CACHE_PREFIX = 'menu:';
const MENU_CACHE_TTL_MS = 60 * 1000;

const toSlug = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const emitMenuUpdated = async () => {
  const io = getIO();
  if (!io) return;
  const items = await MenuItem.find().sort({ category: 1, position: 1, createdAt: 1 });
  io.emit('menu:updated', items);
};

export const getMenuItems = async (req, res) => {
  const includeUnavailable = req.query.includeUnavailable === 'true' && req.user?.role === 'admin';
  const query = includeUnavailable ? {} : { available: true };
  const cacheKey = `${MENU_CACHE_PREFIX}${includeUnavailable ? 'all' : 'available'}`;
  const cached = getCache(cacheKey);
  if (cached) {
    res.locals.cacheStatus = 'HIT';
    return res.json(cached);
  }
  res.locals.cacheStatus = 'MISS';

  const items = await MenuItem.find(query).sort({ category: 1, position: 1, createdAt: 1 });
  setCache(cacheKey, items, MENU_CACHE_TTL_MS);
  res.json(items);
};

export const getLunchOfTheDay = async (_req, res) => {
  const lunch = await MenuItem.findOne({ lunchOfDay: true, available: true });
  res.json(lunch);
};

export const createMenuItem = async (req, res) => {
  let { name, description, image, category, price, tags } = req.body;
  if (!name || !description || !image || !category || Number.isNaN(Number(price))) {
    return res.status(400).json({ message: 'Missing required product fields' });
  }

  // Canonicalize before position check
  category = normalizeCategory(category);

  const countInCategory = await MenuItem.countDocuments({ category });
  const baseSlug = toSlug(name);
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const item = await MenuItem.create({
    name: String(name).trim(),
    slug,
    category: String(category).trim(),
    description: String(description).trim(),
    image: String(image).trim(),
    price: Number(price),
    tags: Array.isArray(tags) ? tags : [],
    position: countInCategory
  });

  clearCacheByPrefix(MENU_CACHE_PREFIX);
  await emitMenuUpdated();
  res.status(201).json(item);
};

export const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const item = await MenuItem.findById(id);
  if (!item) return res.status(404).json({ message: 'Product not found' });

  const allowed = ['name', 'description', 'image', 'category', 'price', 'tags', 'lunchOfDay', 'available'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      item[key] = req.body[key];
    }
  }
  if (req.body.name) item.slug = `${toSlug(req.body.name)}-${item._id.toString().slice(-6)}`;
  await item.save();

  clearCacheByPrefix(MENU_CACHE_PREFIX);
  await emitMenuUpdated();
  res.json(item);
};

export const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Product not found' });
  await item.deleteOne();
  clearCacheByPrefix(MENU_CACHE_PREFIX);
  await emitMenuUpdated();
  res.status(204).send();
};

export const reorderCategoryItems = async (req, res) => {
  const { category, itemIds } = req.body;
  if (!category || !Array.isArray(itemIds)) {
    return res.status(400).json({ message: 'category and itemIds are required' });
  }

  const existing = await MenuItem.find({ category, _id: { $in: itemIds } });
  if (existing.length !== itemIds.length) {
    return res.status(400).json({ message: 'Some products are missing in this category' });
  }

  await Promise.all(
    itemIds.map((id, idx) => MenuItem.updateOne({ _id: id }, { $set: { position: idx } }))
  );

  clearCacheByPrefix(MENU_CACHE_PREFIX);
  await emitMenuUpdated();
  res.json({ ok: true });
};

export const setAvailability = async (req, res) => {
  const { available } = req.body;
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { $set: { available: Boolean(available) } },
    { new: true }
  );
  if (!item) return res.status(404).json({ message: 'Product not found' });
  clearCacheByPrefix(MENU_CACHE_PREFIX);
  await emitMenuUpdated();
  res.json(item);
};

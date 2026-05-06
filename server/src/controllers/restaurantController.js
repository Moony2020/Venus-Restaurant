import NeedItem from '../models/NeedItem.js';
import Order from '../models/Order.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import { getIO } from '../lib/socket.js';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const timeToMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '00:00')
    .split(':')
    .map((v) => Number(v) || 0);
  return h * 60 + m;
};

const getNowStatus = (settings) => {
  const now = new Date();
  if (settings.manualOverride === 'force_open') {
    return { isOpen: true, text: 'Oppet nu (manuellt)', closesAt: null };
  }
  if (settings.manualOverride === 'force_closed') {
    return { isOpen: false, text: settings.manualMessage || 'Stangt just nu', closesAt: null };
  }

  const dayKey = DAY_KEYS[now.getDay()];
  const current = settings.week?.[dayKey];
  if (!current || current.closed) {
    return { isOpen: false, text: 'Stangt idag', closesAt: null };
  }
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = timeToMinutes(current.open);
  const closeMinutes = timeToMinutes(current.close);
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  return {
    isOpen,
    text: isOpen ? `Oppet nu • Stanger kl ${current.close}` : `Stangt • Oppnar kl ${current.open}`,
    closesAt: current.close
  };
};

const getSettingsDoc = async () => {
  let settings = await RestaurantSettings.findOne();
  if (!settings) settings = await RestaurantSettings.create({});
  return settings;
};

const emitSettingsUpdated = async () => {
  const io = getIO();
  if (!io) return;
  const settings = await getSettingsDoc();
  io.emit('restaurant:updated', {
    settings,
    nowStatus: getNowStatus(settings)
  });
};

export const getPublicRestaurantStatus = async (_req, res) => {
  const settings = await getSettingsDoc();
  return res.json({
    week: settings.week,
    manualOverride: settings.manualOverride,
    manualMessage: settings.manualMessage,
    nowStatus: getNowStatus(settings)
  });
};

export const getRestaurantSettingsAdmin = async (_req, res) => {
  const settings = await getSettingsDoc();
  return res.json(settings);
};

export const updateRestaurantSettingsAdmin = async (req, res) => {
  const settings = await getSettingsDoc();
  if (req.body.week) settings.week = req.body.week;
  if (req.body.manualOverride) settings.manualOverride = req.body.manualOverride;
  if (Object.prototype.hasOwnProperty.call(req.body, 'manualMessage')) {
    settings.manualMessage = String(req.body.manualMessage || '');
  }
  await settings.save();
  await emitSettingsUpdated();
  return res.json(settings);
};

export const getNeeds = async (_req, res) => {
  const items = await NeedItem.find().sort({ createdAt: -1 });
  return res.json(items);
};

export const createNeed = async (req, res) => {
  const { name, status, note } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const item = await NeedItem.create({
    name: String(name).trim(),
    status: status || 'ok',
    note: String(note || '').trim()
  });
  const io = getIO();
  if (io) io.emit('needs:updated');
  return res.status(201).json(item);
};

export const updateNeed = async (req, res) => {
  const item = await NeedItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Need item not found' });
  if (req.body.name) item.name = req.body.name;
  if (req.body.status) item.status = req.body.status;
  if (Object.prototype.hasOwnProperty.call(req.body, 'note')) item.note = req.body.note || '';
  await item.save();
  const io = getIO();
  if (io) io.emit('needs:updated');
  return res.json(item);
};

export const deleteNeed = async (req, res) => {
  const item = await NeedItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Need item not found' });
  await item.deleteOne();
  const io = getIO();
  if (io) io.emit('needs:updated');
  return res.status(204).send();
};

export const ensureRestaurantOpenForOrders = async (_req, res, next) => {
  const settings = await getSettingsDoc();
  const status = getNowStatus(settings);
  if (!status.isOpen) {
    return res.status(403).json({ message: 'Restaurangen ar stangd just nu' });
  }
  return next();
};

export const getKitchenOrders = async (_req, res) => {
  const orders = await Order.find({ status: { $in: ['pending', 'preparing', 'ready'] } }).sort({ createdAt: -1 });
  return res.json(orders);
};


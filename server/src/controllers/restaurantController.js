import NeedItem from '../models/NeedItem.js';
// Corrected syntax for restaurant status
import Order from '../models/Order.js';
import RestaurantSettings from '../models/RestaurantSettings.js';
import { clearCacheByPrefix, getCache, setCache } from '../lib/cache.js';
import { getIO } from '../lib/socket.js';

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SETTINGS_CACHE_PREFIX = 'restaurant-settings:';
const SETTINGS_CACHE_TTL_MS = 30 * 1000;
const RESTAURANT_TIMEZONE = process.env.RESTAURANT_TIMEZONE || 'Europe/Stockholm';

const WEEKDAY_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const timeToMinutes = (hhmm) => {
  const normalized = String(hhmm || '').trim().replace('.', ':');
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  let h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  if (h < 0 || h > 24 || m < 0 || m > 59) return 0;
  if (h === 24 && m !== 0) h = 0;
  return h * 60 + m;
};

const getNowInRestaurantTimezone = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: RESTAURANT_TIMEZONE,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());

  const weekday = String(parts.find((part) => part.type === 'weekday')?.value || 'sunday').toLowerCase();
  const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);

  return {
    dayIndex: WEEKDAY_TO_INDEX[weekday] ?? 0,
    nowMinutes: hour * 60 + minute
  };
};

export const getNowStatus = (settings) => {
  const now = getNowInRestaurantTimezone();
  if (settings.manualOverride === 'force_open') {
    return { isOpen: true, text: 'Öppet nu (manuellt)', closesAt: null };
  }
  if (settings.manualOverride === 'force_closed') {
    return { isOpen: false, text: settings.manualMessage || 'Stängt just nu', closesAt: null };
  }

  const nowMinutes = now.nowMinutes;
  
  // Helper to check if a specific day's schedule makes us "Open" right now
  const checkDay = (dayIdx, isYesterday = false) => {
    const dayKey = DAY_KEYS[(dayIdx + 7) % 7];
    const schedule = settings.week?.[dayKey];
    if (!schedule || schedule.closed) return null;

    const openMin = timeToMinutes(schedule.open);
    let closeMin = timeToMinutes(schedule.close);
    if (closeMin === 0 || schedule.close === '24:00') closeMin = 1440;

    const isRollover = closeMin < openMin;

    if (isYesterday) {
      // If we are checking yesterday, we are only "Open" if yesterday had a rollover 
      // and we are currently before that rollover time.
      return isRollover && nowMinutes < closeMin;
    } else {
      // Current day check
      if (isRollover) {
        return nowMinutes >= openMin || nowMinutes < closeMin;
      }
      return nowMinutes >= openMin && nowMinutes < closeMin;
    }
  };

  // 1. Check if we are still open from yesterday's late night
  const openFromYesterday = checkDay(now.dayIndex - 1, true);
  if (openFromYesterday) {
    const yesterdayKey = DAY_KEYS[(now.dayIndex - 1 + 7) % 7];
    const sched = settings.week?.[yesterdayKey];
    return { isOpen: true, text: `Öppet nu • Stänger kl ${sched.close}`, closesAt: sched.close, isRollover: true };
  }

  // 2. Check today's schedule
  const todaySchedule = settings.week?.[DAY_KEYS[now.dayIndex]];
  const isOpenToday = checkDay(now.dayIndex);

  if (isOpenToday) {
    return { 
      isOpen: true, 
      text: `Öppet nu • Stänger kl ${todaySchedule.close}`, 
      closesAt: todaySchedule.close 
    };
  }

  // 3. Otherwise, we are closed
  // Find next opening time (simple version: look at today or tomorrow)
  const tomorrowIdx = (now.dayIndex + 1) % 7;
  const tomorrowSched = settings.week?.[DAY_KEYS[tomorrowIdx]];
  
  let statusText = 'Stängt just nu';
  if (todaySchedule && !todaySchedule.closed && nowMinutes < timeToMinutes(todaySchedule.open)) {
    statusText = `Stängt • Öppnar kl ${todaySchedule.open}`;
  } else if (tomorrowSched && !tomorrowSched.closed) {
    statusText = `Stängt • Öppnar imorgon kl ${tomorrowSched.open}`;
  }

  return { isOpen: false, text: statusText, closesAt: null };
};

const getSettingsDoc = async () => {
  let settings = await RestaurantSettings.findOne();
  if (!settings) settings = await RestaurantSettings.create({});
  return settings;
};

export const emitSettingsUpdated = async () => {
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
  const status = getNowStatus(settings);
  
  // Debug log to help identify why it might be closing early
  const now = new Date();
  console.log(`[STATUS CHECK] Time: ${now.getHours()}:${now.getMinutes()}, isOpen: ${status.isOpen}, override: ${settings.manualOverride}`);

  return res.json({
    week: settings.week,
    manualOverride: settings.manualOverride,
    manualMessage: settings.manualMessage,
    nowStatus: status
  });
};

export const getRestaurantSettingsAdmin = async (_req, res) => {
  const cacheKey = `${SETTINGS_CACHE_PREFIX}admin`;
  const cached = getCache(cacheKey);
  if (cached) {
    res.locals.cacheStatus = 'HIT';
    return res.json(cached);
  }
  res.locals.cacheStatus = 'MISS';

  const settings = await getSettingsDoc();
  setCache(cacheKey, settings, SETTINGS_CACHE_TTL_MS);
  return res.json(settings);
};

export const updateRestaurantSettingsAdmin = async (req, res) => {
  try {
    console.log('[SETTINGS SAVE] Updating settings...');
    console.log('[SETTINGS SAVE] Friday data received:', JSON.stringify(req.body.week?.friday));
    console.log('[SETTINGS SAVE] Saturday data received:', JSON.stringify(req.body.week?.saturday));
    console.log('[SETTINGS SAVE] manualOverride:', req.body.manualOverride);
    const settings = await getSettingsDoc();
    
    if (req.body.week) {
      settings.week = JSON.parse(JSON.stringify(req.body.week));
      settings.markModified('week');
    }
    
    if (Object.prototype.hasOwnProperty.call(req.body, 'manualOverride')) {
      settings.manualOverride = req.body.manualOverride || 'none';
    }
    
    if (Object.prototype.hasOwnProperty.call(req.body, 'manualMessage')) {
      settings.manualMessage = String(req.body.manualMessage || '');
    }
    
    await settings.save();
    
    // Clear ALL caches to ensure fresh data for public API
    clearCacheByPrefix(SETTINGS_CACHE_PREFIX);
    
    // Emit fresh status to all clients
    await emitSettingsUpdated();

    const status = getNowStatus(settings);
    console.log('[SETTINGS SAVE] Success - Status after save:', JSON.stringify(status));
    return res.json(settings);
  } catch (err) {
    console.error('[SETTINGS SAVE] Error:', err);
    return res.status(500).json({ message: err.message });
  }
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
  const orders = await Order.find({
    status: { $in: ['pending', 'preparing', 'ready'] },
    $or: [
      { paymentMethod: 'pay_on_pickup' },
      { paymentStatus: 'paid' }
    ]
  }).sort({ createdAt: -1 });
  return res.json(orders);
};

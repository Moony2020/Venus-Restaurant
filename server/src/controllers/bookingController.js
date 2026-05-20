import Booking from '../models/Booking.js';
import { getIO } from '../lib/socket.js';
import { sendBookingConfirmation } from '../lib/mailer.js';
import RestaurantSettings from '../models/RestaurantSettings.js';

export const createBooking = async (req, res) => {
  const {
    date = '',
    time = '',
    guests = '',
    name = '',
    email = '',
    phone = '',
    notes = ''
  } = req.body || {};

  if (!date || !time || !name || !email || !phone) {
    return res.status(400).json({ message: 'Missing required booking fields.' });
  }

  const guestsNumber = Number(guests);
  if (!Number.isFinite(guestsNumber) || guestsNumber < 1 || guestsNumber > 20) {
    return res.status(400).json({ message: 'Guests must be between 1 and 20.' });
  }

  // Timezone-safe weekday parsing
  const getWeekdayFromDateStr = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    if (Number.isNaN(dateObj.getTime())) return null;
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return weekdays[dateObj.getDay()];
  };

  const bookingWeekday = getWeekdayFromDateStr(date);
  if (!bookingWeekday) {
    return res.status(400).json({ message: 'Ogiltigt datumformat.' });
  }

  const settings = await RestaurantSettings.findOne() || await RestaurantSettings.create({});
  const daySched = settings.week?.[bookingWeekday];

  if (daySched) {
    if (daySched.closed) {
      return res.status(400).json({ message: 'Restaurangen är stängd hela dagen det valda datumet.' });
    }

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

    const isTimeWithinHours = (timeStr, openTime, closeTime) => {
      const timeMin = timeToMinutes(timeStr);
      const openMin = timeToMinutes(openTime);
      let closeMin = timeToMinutes(closeTime);
      
      if (closeTime === '00:00' || closeTime === '24:00' || closeMin === 0) {
        closeMin = 1440;
      }
      
      const isRollover = closeMin < openMin;
      
      if (isRollover) {
        return timeMin >= openMin || timeMin < closeMin;
      } else {
        return timeMin >= openMin && timeMin < closeMin;
      }
    };

    if (!isTimeWithinHours(time, daySched.open, daySched.close)) {
      return res.status(400).json({ message: 'Den valda tiden ligger utanför restaurangens öppettider.' });
    }
  }

  const booking = await Booking.create({
    date: String(date).trim(),
    time: String(time).trim(),
    guests: guestsNumber,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 200),
    phone: String(phone).trim().slice(0, 30),
    notes: String(notes).trim().slice(0, 500)
  });

  const io = getIO();
  if (io) io.emit('booking:new', booking);

  // Send confirmation email (non-blocking)
  sendBookingConfirmation(booking).catch(() => {});

  return res.status(201).json(booking);
};

export const getBookingsAdmin = async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status && ['new', 'confirmed', 'cancelled'].includes(status)) {
    query.status = status;
  }

  const bookings = await Booking.find(query).sort({ createdAt: -1 });
  return res.json(bookings);
};

export const updateBookingStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['new', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status.' });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.status = status;
  await booking.save();
  return res.json(booking);
};

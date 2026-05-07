import Booking from '../models/Booking.js';
import { sendBookingConfirmation } from '../lib/mailer.js';

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

  const booking = await Booking.create({
    date: String(date).trim(),
    time: String(time).trim(),
    guests: guestsNumber,
    name: String(name).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 200),
    phone: String(phone).trim().slice(0, 30),
    notes: String(notes).trim().slice(0, 500)
  });

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

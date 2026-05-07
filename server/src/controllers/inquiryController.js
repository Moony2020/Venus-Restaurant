import Inquiry from '../models/Inquiry.js';
import { sendInquiryAutoReply, sendInquiryNotification } from '../lib/mailer.js';

export const createInquiry = async (req, res) => {
  const inquiry = await Inquiry.create({
    user: req.user?._id || null,
    fullName: req.body.fullName,
    email: req.body.email,
    eventType: req.body.eventType,
    guests: req.body.guests,
    preferredDate: req.body.preferredDate || '',
    budgetRange: req.body.budgetRange || '',
    message: req.body.message,
    paymentStatus: 'pending'
  });

  // Reusing existing mailer functions (can rename them later if needed)
  await Promise.allSettled([sendInquiryNotification(inquiry), sendInquiryAutoReply(inquiry)]);

  res.status(201).json({ message: 'Inquiry submitted successfully', inquiryId: inquiry._id, inquiry });
};

export const getInquiries = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  const inquiries = await Inquiry.find(filter).sort({ createdAt: -1 });
  res.json(inquiries);
};

export const getInquiryStats = async (_req, res) => {
  const stats = await Inquiry.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        paid: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        booked: {
          $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] }
        },
        new: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        }
      }
    }
  ]);

  res.json(stats[0] || { total: 0, paid: 0, booked: 0, new: 0 });
};

export const getInquiryById = async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  const isAdmin = req.user?.role === 'admin';
  const isOwner = inquiry.user && req.user?._id && inquiry.user.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

  return res.json(inquiry);
};

export const updateInquiryStatus = async (req, res) => {
  const { status } = req.body;
  if (!status || !['new', 'contacted', 'booked', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid inquiry status' });
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  return res.json(inquiry);
};

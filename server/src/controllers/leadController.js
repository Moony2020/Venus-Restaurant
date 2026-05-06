import Lead from '../models/Lead.js';
import { sendLeadAutoReply, sendLeadNotification } from '../lib/mailer.js';

export const createLead = async (req, res) => {
  const lead = await Lead.create({
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

  await Promise.allSettled([sendLeadNotification(lead), sendLeadAutoReply(lead)]);

  res.status(201).json({ message: 'Lead submitted successfully', leadId: lead._id, lead });
};

export const getLeads = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  const leads = await Lead.find(filter).sort({ createdAt: -1 });
  res.json(leads);
};

export const getLeadStats = async (_req, res) => {
  const stats = await Lead.aggregate([
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

export const getLeadById = async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });

  const isAdmin = req.user?.role === 'admin';
  const isOwner = lead.user && req.user?._id && lead.user.toString() === req.user._id.toString();
  if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Forbidden' });

  return res.json(lead);
};

export const updateLeadStatus = async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  return res.json(lead);
};

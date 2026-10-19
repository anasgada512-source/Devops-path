import { Router } from 'express';
import Contact from '../models/Contact.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, EMAIL_RE } from '../utils/helpers.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();

    if (name.length < 2) return res.status(400).json({ message: 'Please enter your name.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone))
      return res.status(400).json({ message: 'Enter a valid phone number or leave it empty.' });
    if (message.length < 10)
      return res.status(400).json({ message: 'Message should be at least 10 characters.' });

    await Contact.create({ name, email, phone, message });
    res.status(201).json({ ok: true, message: 'Thanks! Your message has been received.' });
  })
);

// Admin: read messages
router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const items = await Contact.find().sort('-createdAt').limit(100).lean();
    res.json(items);
  })
);

export default router;

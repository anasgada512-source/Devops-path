import { Router } from 'express';
import jwt from 'jsonwebtoken';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { asyncHandler, slugify } from '../utils/helpers.js';

const router = Router();

// Is the caller an admin? (used so admins can also see drafts) - never throws
async function isAdminRequest(req) {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return false;
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const u = await User.findById(id).select('role');
    return u?.role === 'admin';
  } catch {
    return false;
  }
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = (await isAdminRequest(req)) ? {} : { published: true };
    if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();
    if (req.query.q) {
      const re = new RegExp(escapeRe(String(req.query.q).slice(0, 60)), 'i');
      filter.$or = [{ title: re }, { excerpt: re }, { tags: re }];
    }
    const posts = await Post.find(filter).select('-content').sort('-createdAt').lean();
    res.json(posts);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).lean();
    if (!post || (!post.published && !(await isAdminRequest(req))))
      return res.status(404).json({ message: 'Post not found.' });
    res.json(post);
  })
);

function readBody(body) {
  const tags = Array.isArray(body.tags)
    ? body.tags
    : String(body.tags || '').split(',');
  return {
    title: String(body.title || '').trim(),
    excerpt: String(body.excerpt || '').trim().slice(0, 300),
    content: String(body.content || ''),
    tags: tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8),
    published: body.published !== false,
  };
}

router.post(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = readBody(req.body);
    if (data.title.length < 3) return res.status(400).json({ message: 'Title is required.' });
    if (data.content.trim().length < 20)
      return res.status(400).json({ message: 'Write at least a few lines of content.' });

    let slug = slugify(data.title) || 'post';
    if (await Post.exists({ slug })) slug += '-' + Date.now().toString(36);
    const post = await Post.create({ ...data, slug, authorName: req.user.name });
    res.status(201).json(post);
  })
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const data = readBody(req.body);
    if (data.title.length < 3) return res.status(400).json({ message: 'Title is required.' });
    const post = await Post.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json(post);
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ ok: true });
  })
);

export default router;

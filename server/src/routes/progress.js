import { Router } from 'express';
import Topic from '../models/Topic.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json(req.user.completed);
});

// body: { topic, lesson, done }
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const topic = String(req.body.topic || '');
    const lesson = String(req.body.lesson || '');
    const done = req.body.done !== false;

    const exists = await Topic.exists({ slug: topic, 'lessons.slug': lesson });
    if (!exists) return res.status(404).json({ message: 'Lesson not found.' });

    const user = req.user;
    user.completed = user.completed.filter((c) => !(c.topic === topic && c.lesson === lesson));
    if (done) user.completed.push({ topic, lesson });
    await user.save();

    res.json(user.completed);
  })
);

export default router;

import { Router } from 'express';
import Topic from '../models/Topic.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

const summarize = (t) => ({
  slug: t.slug,
  order: t.order,
  stage: t.stage,
  title: t.title,
  icon: t.icon,
  description: t.description,
  outcomes: t.outcomes,
  lessonCount: t.lessons.length,
  minutes: t.lessons.reduce((sum, l) => sum + (l.minutes || 0), 0),
  lessons: t.lessons.map((l) => ({
    slug: l.slug,
    title: l.title,
    summary: l.summary,
    minutes: l.minutes,
  })),
});

// All topics (without lesson body) - used by roadmap, home, sidebar
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const topics = await Topic.find().select('-lessons.content').sort('order').lean();
    res.json(topics.map(summarize));
  })
);

// Search across lesson titles, summaries and content
router.get(
  '/search/all',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    if (q.length < 2) return res.json([]);
    const topics = await Topic.find().sort('order').lean();
    const results = [];
    for (const t of topics) {
      for (const l of t.lessons) {
        const hay = (l.title + ' ' + l.summary + ' ' + l.content).toLowerCase();
        if (hay.includes(q)) {
          const inTitle = l.title.toLowerCase().includes(q);
          results.push({
            topic: t.slug,
            topicTitle: t.title,
            lesson: l.slug,
            title: l.title,
            summary: l.summary,
            score: inTitle ? 2 : 1,
          });
        }
      }
    }
    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 25));
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const topic = await Topic.findOne({ slug: req.params.slug })
      .select('-lessons.content')
      .lean();
    if (!topic) return res.status(404).json({ message: 'Topic not found.' });
    res.json(summarize(topic));
  })
);

// One lesson with full content, plus previous/next across the whole curriculum
router.get(
  '/:topic/lessons/:lesson',
  asyncHandler(async (req, res) => {
    const { topic: topicSlug, lesson: lessonSlug } = req.params;

    const all = await Topic.find()
      .select('slug title order lessons.slug lessons.title')
      .sort('order')
      .lean();
    const flat = all.flatMap((t) =>
      t.lessons.map((l) => ({ topic: t.slug, topicTitle: t.title, lesson: l.slug, title: l.title }))
    );
    const idx = flat.findIndex((x) => x.topic === topicSlug && x.lesson === lessonSlug);
    if (idx === -1) return res.status(404).json({ message: 'Lesson not found.' });

    const doc = await Topic.findOne({ slug: topicSlug }).lean();
    const lesson = doc && doc.lessons.find((l) => l.slug === lessonSlug);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });

    res.json({
      topic: summarize(doc), // summarize() leaves out lesson bodies
      lesson,
      prev: idx > 0 ? flat[idx - 1] : null,
      next: idx < flat.length - 1 ? flat[idx + 1] : null,
      position: { current: idx + 1, total: flat.length },
    });
  })
);

export default router;

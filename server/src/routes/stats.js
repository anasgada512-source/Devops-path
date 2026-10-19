import { Router } from 'express';
import Topic from '../models/Topic.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/helpers.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [topics, posts, learners] = await Promise.all([
      Topic.find().select('lessons.slug').lean(),
      Post.countDocuments({ published: true }),
      User.countDocuments(),
    ]);
    res.json({
      topics: topics.length,
      lessons: topics.reduce((n, t) => n + t.lessons.length, 0),
      posts,
      learners,
    });
  })
);

export default router;

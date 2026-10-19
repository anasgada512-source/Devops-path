import 'dotenv/config';
import { fileURLToPath } from 'url';
import Topic from '../models/Topic.js';
import Post from '../models/Post.js';
import { posts } from './posts.js';
import { backend, databases, linux } from './content1.js';
import { git, networking, docker, cicd } from './content2.js';
import { cloud, iac, monitoring, systemDesign, deploy } from './content3.js';

const topics = [
  backend, databases, linux, git, networking, docker, cicd,
  cloud, iac, monitoring, systemDesign, deploy,
].map((t, i) => ({
  ...t,
  order: i + 1,
  lessons: t.lessons.map((l, j) => ({ ...l, order: j + 1 })),
}));

export async function seedTopics() {
  await Topic.deleteMany({});
  await Topic.insertMany(topics);
  const lessons = topics.reduce((n, t) => n + t.lessons.length, 0);
  console.log('Seeded ' + topics.length + ' topics and ' + lessons + ' lessons');
}

export async function seedPosts() {
  await Post.deleteMany({ authorName: 'MOHD ANAS', slug: { $in: posts.map((p) => p.slug) } });
  await Post.insertMany(posts.map((p) => ({ ...p, authorName: 'MOHD ANAS', published: true })));
  console.log('Seeded ' + posts.length + ' blog posts');
}

// Runs on server start: only fills empty collections, never touches existing data.
export async function seedIfEmpty() {
  if ((await Topic.estimatedDocumentCount()) === 0) await seedTopics();
  if ((await Post.estimatedDocumentCount()) === 0) await seedPosts();
}

// `npm run seed` -> force refresh topics and the default posts (users are never touched)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { connectDB } = await import('../config/db.js');
  const mongoose = (await import('mongoose')).default;
  await connectDB();
  await seedTopics();
  await seedPosts();
  await mongoose.disconnect();
}

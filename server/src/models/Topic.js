import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    minutes: { type: Number, default: 8 },
    content: { type: String, default: '' },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  order: { type: Number, default: 0 },
  stage: { type: Number, default: 1 },
  title: { type: String, required: true },
  icon: { type: String, default: '📦' },
  description: { type: String, default: '' },
  outcomes: [String],
  lessons: [lessonSchema],
});

export default mongoose.model('Topic', topicSchema);

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: '', maxlength: 300 },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    authorName: { type: String, default: 'MOHD ANAS' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);

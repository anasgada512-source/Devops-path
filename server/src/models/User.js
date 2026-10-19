import mongoose from 'mongoose';

const completedSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    lesson: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    completed: [completedSchema],
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    userId: this.userId,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('User', userSchema);

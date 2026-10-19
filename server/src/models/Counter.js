import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

// Sequential, human friendly user id: DEV-00001, DEV-00002 ...
export async function nextUserId() {
  const c = await Counter.findOneAndUpdate(
    { _id: 'user' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return 'DEV-' + String(c.seq).padStart(5, '0');
}

export default Counter;

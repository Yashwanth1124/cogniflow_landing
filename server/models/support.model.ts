
import mongoose from 'mongoose';

const supportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

export const SupportModel = mongoose.model('Support', supportSchema);

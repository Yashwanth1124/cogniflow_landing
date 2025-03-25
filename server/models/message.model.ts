import mongoose, { Schema, Document } from 'mongoose';
import { Message } from '@shared/schema';

// Define interface for the Message document
export interface IMessageDocument extends Document, Omit<Message, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema
const messageSchema = new Schema<IMessageDocument>({
  content: { type: String, required: true },
  userId: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  isAi: { type: Boolean, default: false }
}, {
  timestamps: true,
  // Convert _id to id in JSON responses
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Create and export model
export const MessageModel = mongoose.model<IMessageDocument>('Message', messageSchema);
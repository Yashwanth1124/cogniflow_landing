import mongoose, { Schema, Document } from 'mongoose';
import { Notification } from '@shared/schema';

// Define interface for the Notification document
export interface INotificationDocument extends Document, Omit<Notification, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema
const notificationSchema = new Schema<INotificationDocument>({
  type: { type: String, default: null },
  message: { type: String, required: true },
  userId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
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
export const NotificationModel = mongoose.model<INotificationDocument>('Notification', notificationSchema);
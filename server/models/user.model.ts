import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@shared/schema';

// Define interface for the User document
export interface IUserDocument extends Document, Omit<User, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema
const userSchema = new Schema<IUserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: null },
  email: { type: String, default: null },
  company: { type: String, default: null },
  role: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
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
export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
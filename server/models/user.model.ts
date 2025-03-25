
import mongoose, { Schema, Document } from 'mongoose';
import { User } from '@shared/schema';

export interface IUserDocument extends Document, Omit<User, 'id'> {
  id: number;
}

const userSchema = new Schema<IUserDocument>({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);

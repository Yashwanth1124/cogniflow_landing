import mongoose, { Schema, Document } from 'mongoose';
import { Transaction } from '@shared/schema';

// Define interface for the Transaction document
export interface ITransactionDocument extends Document, Omit<Transaction, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema
const transactionSchema = new Schema<ITransactionDocument>({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true },
  status: { type: String, default: null },
  userId: { type: Number, required: true },
  amount: { type: Number, required: true },
  description: { type: String, default: null },
  category: { type: String, default: null }
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
export const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', transactionSchema);
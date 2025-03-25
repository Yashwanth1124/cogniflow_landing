import mongoose, { Schema, Document } from 'mongoose';
import { Invoice } from '@shared/schema';

// Define interface for the Invoice document
export interface IInvoiceDocument extends Document, Omit<Invoice, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema for invoice items
const invoiceItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

// Create schema
const invoiceSchema = new Schema<IInvoiceDocument>({
  userId: { type: Number, required: true },
  amount: { type: Number, required: true },
  clientName: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: null },
  items: { type: [invoiceItemSchema], default: [] }
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
export const InvoiceModel = mongoose.model<IInvoiceDocument>('Invoice', invoiceSchema);
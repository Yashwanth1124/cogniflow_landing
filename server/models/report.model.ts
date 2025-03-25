import mongoose, { Schema, Document } from 'mongoose';
import { Report } from '@shared/schema';

// Define interface for the Report document
export interface IReportDocument extends Document, Omit<Report, 'id'> {
  // Document already includes _id which maps to our id field
}

// Create schema
const reportSchema = new Schema<IReportDocument>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  userId: { type: Number, required: true }
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
export const ReportModel = mongoose.model<IReportDocument>('Report', reportSchema);
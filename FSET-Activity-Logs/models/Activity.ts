import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'Education' | 'Training' | 'Job Search' | 'Job Application' | 'Interview' | 'Workshop' | 'Counseling' | 'Other';
  description: string;
  date: Date;
  duration?: number; // in minutes
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUser', // References user in AUTH_MONGODB (FSC database)
      required: true,
    },
    activityType: {
      type: String,
      enum: ['Education', 'Training', 'Job Search', 'Job Application', 'Interview', 'Workshop', 'Counseling', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ActivitySchema.index({ userId: 1, date: -1 });
ActivitySchema.index({ status: 1 });

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;

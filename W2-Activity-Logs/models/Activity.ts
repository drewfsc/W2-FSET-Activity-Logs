import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityComment {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: Date;
}

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'Job Search' | 'Job Application' | 'Interview' | 'Job Training' | 'Work Hours' | 'Meeting' | 'Other';
  description: string;
  date: Date;
  duration?: number; // in minutes
  status: 'Pending' | 'Completed' | 'Cancelled';
  notes?: string;
  attachments?: string[];
  comments?: IActivityComment[];
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
      enum: ['Job Search', 'Job Application', 'Interview', 'Job Training', 'Work Hours', 'Meeting', 'Other'],
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
    comments: [{
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      userName: {
        type: String,
        required: true,
      },
      userRole: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
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

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
  logType: 'Self-Directed Employment Search Log' | 'W-2 Activity Log' | 'Work Experience Log';
  weekStart: Date; // Sunday of the week this log belongs to
  activityType?: 'Job Search' | 'Job Application' | 'Interview' | 'Job Training' | 'Work Hours' | 'Meeting' | 'Other'; // Optional for backward compatibility
  description: string;
  date: Date;
  startTime?: string; // Format: "HH:MM" (24-hour)
  endTime?: string; // Format: "HH:MM" (24-hour)
  duration?: number; // in minutes (auto-calculated from start/end time)
  status?: 'Pending' | 'Completed' | 'Cancelled'; // Optional for backward compatibility
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
    logType: {
      type: String,
      enum: ['Self-Directed Employment Search Log', 'W-2 Activity Log', 'Work Experience Log'],
      required: true,
    },
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: ['Job Search', 'Job Application', 'Interview', 'Job Training', 'Work Hours', 'Meeting', 'Other'],
      required: false, // Optional for backward compatibility
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
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    duration: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled'],
      required: false, // Optional for backward compatibility
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
ActivitySchema.index({ userId: 1, weekStart: 1, logType: 1 }); // For weekly log lookups

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;

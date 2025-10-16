import mongoose, { Schema, Document, Model, Connection } from 'mongoose';

export interface IAuthUser extends Document {
  email: string;
  name: string;
  phone?: string; // FSC uses 'phone' not 'phoneNumber'
  level?: string; // FSC uses 'level' for role (admin, participant, coach, etc.)
  programs?: string[]; // FSC stores multiple programs
  city?: string;
  state?: string;
  street?: string;
  zip?: string;
  county?: string[];
  homeCounty?: string;
  image?: string;
  emailVerified?: Date;
  lastLogin?: Date;
  timestamp?: Date; // Original creation timestamp
  isYouth?: boolean;
  appearance?: string;
  coach?: any[]; // Coach assignment history
  coachUpdate?: Date;
  referralSource?: string; // Where the user signed up from (W2 Activity Logs, FSET Activity Logs, etc.)
}

const AuthUserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
    },
    level: {
      type: String,
      enum: ['admin', 'coach', 'client'],
      default: 'client',
    },
    programs: [{
      type: String,
    }],
    city: String,
    state: String,
    street: String,
    zip: String,
    county: [String],
    homeCounty: String,
    image: String,
    emailVerified: Date,
    lastLogin: Date,
    timestamp: Date,
    isYouth: Boolean,
    appearance: String,
    coach: [Schema.Types.Mixed],
    coachUpdate: Date,
    referralSource: String,
  },
  {
    timestamps: false, // FSC doesn't use timestamps
    collection: 'users', // Use existing 'users' collection
  }
);

// Function to get or create the model on a specific connection
export function getAuthUserModel(connection: Connection): Model<IAuthUser> {
  // IMPORTANT: Always use 'User' as model name (not 'AuthUser') to prevent Mongoose
  // from pluralizing to 'authusers'. The schema specifies collection: 'users'
  const modelName = 'User';

  // Delete cached model to ensure schema updates are applied
  if (connection.models[modelName]) {
    delete connection.models[modelName];
  }

  // Create and return new model with explicit collection name
  return connection.model<IAuthUser>(modelName, AuthUserSchema, 'users');
}

// For TypeScript, export a type that can be used
export type AuthUserModel = Model<IAuthUser>;

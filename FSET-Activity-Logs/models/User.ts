import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'client' | 'coach' | 'admin';
  program: 'FSET';
  language: 'en' | 'es' | 'hmn';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
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
    role: {
      type: String,
      enum: ['client', 'coach', 'admin'],
      default: 'client',
      required: true,
    },
    program: {
      type: String,
      enum: ['FSET'],
      default: 'FSET',
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'es', 'hmn'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

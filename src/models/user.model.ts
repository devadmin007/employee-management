import { Document, Schema, model } from "mongoose";

export interface User {
  username: string;
  password: string;
  role: string;
}

export interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
   
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["HR", "EMPLOYEE", "ADMIN", "PROJECT_MANAGER"],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<UserDocument>("User", userSchema);

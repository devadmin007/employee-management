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
      validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9_-]+$/.test(value);
      },
       message: "Username must contain only alphanumeric characters, hyphens, or underscores.",
      }
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

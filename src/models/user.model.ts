import { Document, Schema, Types, model } from "mongoose";

export interface User {
  username: string;
  password: string;
  role:  Types.ObjectId;
  email: string;
  image: string;
  personalEmail :string,
  firstName: string;
  lastName: string;
  fullName: string;
  isActive:boolean
  isDeleted:boolean
  employeeId:string
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
        message:
          "Username must contain only alphanumeric characters, hyphens, or underscores.",
      },
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
       personalEmail: {
      type: String,
    
      lowercase: true,
    },
    firstName : {
      type: String,
    },
    lastName: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },
      employeeId: {
      type: String,
    },
    image:{
      type : String
    },
    role: {
      ref: 'Role',
      type: Schema.Types.ObjectId,
      required: true,
    },
      isActive: { type: Boolean, default: true },
      isDeleted: { type: Boolean, default: false },
  },

  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<UserDocument>("User", userSchema);

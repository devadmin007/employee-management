import { Document, model, Schema, Types } from "mongoose";

export interface LeaveBalance {
  employeeId: Types.ObjectId;
  leave: number;
  extraLeave: number;
  usedLeave: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface LeaveBalanceDocument extends LeaveBalance, Document {}

export const LeaveBalanceSchema = new Schema<LeaveBalanceDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    leave: {
      type: Number,
    },
    extraLeave: {
      type: Number,
      default: 0,
    },
    usedLeave: {
      type: Number,
      default: 0,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const LeaveBalance = model<LeaveBalanceDocument>(
  "LeaveBalance",
  LeaveBalanceSchema
);

import { AnyBulkWriteOperation, Document, model, Schema, Types } from "mongoose";

export interface Leave {
  employeeId: Types.ObjectId;
  date: Date;
  leave_type: string;
  totalDays: number;
  status: string;
  comments: string;
  approveId: Types.ObjectId;
  approveById: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
}

export interface LeaveDocument extends Leave, Document { }

const leaveSchema = new Schema<LeaveDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    date: {
      type: Date,
    },
    leave_type: {
      type: String,
      enum: ['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']
    },

    totalDays: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECT'],
      default: 'PENDING'
    },
    comments: {
      type: String,
    },
    approveId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approveById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);


export const Leave = model<LeaveDocument>("Leave", leaveSchema);
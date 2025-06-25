import { Document, model, Schema, Types } from "mongoose";

export interface Leave {
  employeeId: Types.ObjectId;
  leave_type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  comments: string;
  approveId: Types.ObjectId;
   approveById: Types.ObjectId;
  isActive: boolean;
  isDeleted: boolean;
}

export interface LeaveDocument extends Leave, Document {}

const leaveSchema = new Schema<LeaveDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    leave_type: {
      type: String,
      enum : ['FIRST_HALF','SECOND_HALF','FULL_DAY']
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum : ['PENDING','APPROVED','REJECT'],
      default : 'PENDING'
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


export const Leave = model<LeaveDocument>("Leave",leaveSchema);
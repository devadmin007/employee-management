import { Document, model, Schema, Types } from "mongoose";

export interface Salary {
  employeeId: Types.ObjectId;
  baseSalary: number;
  netSalary: number;
  leaveDeducation: number;
  generetedAt: Date;
  month: string;
  isActive?: boolean;
  isDeleted?: boolean;
}
export interface SalaryDocument extends Salary, Document {}

const salarySchema = new Schema<SalaryDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    baseSalary: {
      type: Number,
    },
   netSalary :{
    type: Number,
   },
    leaveDeducation: {
      type: Number,
    },

    generetedAt: {
      type: Date,
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);


export const Salary = model<SalaryDocument>("Salary", salarySchema);
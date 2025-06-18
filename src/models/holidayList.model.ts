import { Document, model, Schema } from "mongoose";

export interface Holiday {
  label: string;
}

export interface HolidayDocument extends Holiday, Document {}

const holidaySchema = new Schema<HolidayDocument>(
  {
    label: {
      required: true,
      type: String,
      unique:true
    },
  },
  { timestamps: true, versionKey: false }
);

export const Holiday = model<HolidayDocument>("Holidays",holidaySchema);

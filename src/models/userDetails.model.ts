import { Document, Types, Schema, model } from "mongoose";

export interface UserDetails {
  userId: Types.ObjectId;
  employeeId: string;
  countryCode: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: string;
  address: {
    address: string;
    zipCode: string;
  };
  country: string;
  state: string;
  city: string;
  joiningDate: Date;
  probationDate: Date;
  panNo: string;
  aadharNo: string;
  currentSalary: string;
  previousExperience: string;
  pfNo: string;
  uanDetail: string;
  esicNo: string;
  esicStart: Date;
  esicEnd: Date;
  teamId: Types.ObjectId;
  designationId: Types.ObjectId;
  department: string;
  skill: Types.ObjectId;
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
  isDeleted: boolean;
}

export interface UserDetailsDocument extends UserDetails, Document {}

const userDetailSchema = new Schema<UserDetailsDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      address: { type: String, required: true },
      zipCode: {
        type: String,
        required: true,
      },
    },
    country: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    probationDate: {
      type: Date,
      required: true,
    },
    panNo: {
      type: String,
      required: true,
    },
    aadharNo: {
      type: String,
      required: true,
    },

    currentSalary: {
      type: String,
      required: true,
    },
    previousExperience: {
      type: String,
      required: true,
    },
    pfNo: {
      type: String,
      required: true,
    },

    uanDetail: {
      type: String,
      required: true,
    },
    esicNo: {
      type: String,
      required: true,
    },
    esicStart: {
      type: Date,
      required: true,
    },

    esicEnd: {
      type: Date,
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Team",
    },
    designationId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Designation",
    },
    department: {
      type: String,
      required: true,
    },
    skill: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Skill",
    },
    bankDetails: {
      accountNumber: {
        type: String,
        required: true,
      },
      ifscCode: {
        type: String,
        required: true,
      },
      branchName: {
        type: String,
        required: true,
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserDetails = model<UserDetailsDocument>("User", userDetailSchema);

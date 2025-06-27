import moment from "moment";
import { Request, Response } from "express";
import { Leave } from "../models/leave.model";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { messages } from "../utils/messages";
import { leaveSchema } from "../utils/zod";
import { User } from "../models/user.model";
import { StatusCodes } from "http-status-codes";
import { UserDetails } from "../models/userDetails.model";
import { Role } from "../models/role.model";
import { paginationObject } from "../utils/pagination";
import { LeaveBalance } from "../models/leaveBalance.models";
import mongoose from "mongoose";

export const addLeave = async (req: any, res: Response) => {
  try {
    // const parseData = leaveSchema.parse(req.body);
    const userId = req.userInfo?.id;

    const { date, comments } = req.body;

    if (!Array.isArray(date) || date.length === 0) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Leave dates are required");
    }

    // Fetch Approver
    let existingUser: any;

    if (req.userInfo?.role?.role === "EMPLOYEE") {
      existingUser = await UserDetails.findOne({ userId: userId });
    } else if (
      req.userInfo?.role.role === "PROJECT_MANAGER" ||
      req.userInfo?.role.role === "HR"
    ) {
      const roles = await Role.findOne({ role: "ADMIN" });
      existingUser = await User.findOne({ role: roles?._id });
    }

    if (!existingUser) {
      const roles = await Role.findOne({ role: "ADMIN" });
      existingUser = await User.findOne({ role: roles?._id });
    }

    const approveId = existingUser?.managerId || existingUser?._id;

    let totalLeaveDays = 0;
    const leavesToInsert: any[] = [];

    for (const leave of date) {
      const { date, leave_type } = leave;

      // Convert date to start of day to avoid timezone issues
      const leaveDate = moment(date).startOf("day").toDate();

      const existingLeave = await Leave.findOne({
        employeeId: userId,
        date: leaveDate,
        approveId: approveId,
        isDeleted: false,
      });

      if (existingLeave) {
        continue; // skip if already exists
      }

      let dayValue = 0;
      if (leave_type === "FULL_DAY") {
        dayValue = 1;
      } else if (["FIRST_HALF", "SECOND_HALF"].includes(leave_type)) {
        dayValue = 0.5;
      }

      totalLeaveDays += dayValue;

      leavesToInsert.push({
        employeeId: userId,
        date: leaveDate,
        leave_type,
        totalDays: dayValue,
        status: "PENDING",
        comments,
        approveId,
        isActive: true,
        isDeleted: false,
      });
    }

    if (leavesToInsert.length === 0) {
      return apiResponse(res, StatusCodes.CONFLICT, "All leaves already exist or invalid");
    }

    const insertedLeaves = await Leave.insertMany(leavesToInsert);

    return apiResponse(res, StatusCodes.CREATED, "Leave(s) added successfully", {
      totalLeaveDays,
      leaves: insertedLeaves,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getLeaveById = async (req: Request, res: Response) => {
  try {
    const leaveId = req.params.id;
    const leave = await Leave.findById(leaveId)
      .populate({
        path: "approveId",
        select: "firstName lastName -_id",
      }).populate({
        path: "approveById",
        select: "firstName lastName -_id",
      }).populate({
        path: "employeeId",
        select: "firstName lastName -_id",
      })
      .lean();

    if (!leave) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.LEAVE_FOUND, leave);
  } catch (error) {
    handleError(res, error);
  }
};


export const leaveList = async (req: any, res: Response) => {
  try {
    const pagination = paginationObject(req.query);

    const { skip, resultPerPage, sort, } = pagination;

    const { status, startDate, endDate, filter } = req.query;

    const match: any = { isDeleted: false };
    if (req.userInfo?.role?.role === "EMPLOYEE") {
      match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
    }
    if (req.userInfo?.role?.role === 'PROJECT_MANAGER') {
      if (filter === "REQUESTED") {
        match.approveId = new mongoose.Types.ObjectId(req.userInfo?.id);
      } else {
        match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
      }
    }
    if (req.userInfo?.role?.role === "HR") {
      if (filter === "REQUESTED") {
        match.approveId = new mongoose.Types.ObjectId(req.userInfo?.id);
      } else {
        match.employeeId = new mongoose.Types.ObjectId(req.userInfo?.id);
      }
    }

    if (status) match.status = status;
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate as string);
      if (endDate) match.date.$lte = new Date(endDate as string);
    }

    const { search } = req.query;

    const pipeline: any = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approveId",
          foreignField: "_id",
          as: "approveId",
        },
      },
      {
        $unwind: { path: "$employeeId", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$approveId", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          employee_full_name: {
            $concat: ["$employeeId.firstName", " ", "$employeeId.lastName"]
          },
          approver_full_name: {
            $concat: ["$approveId.firstName", " ", "$approveId.lastName"]
          },
        },
      },
    ];

    // Add search filter on computed full names
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { employee_full_name: { $regex: search, $options: "i" } },
            { approver_full_name: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          date: 1,
          status: 1,
          comments: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          leave_type: 1,
          totalDays: 1,
          employee_full_name: 1,
          approver_full_name: 1,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: resultPerPage }
    );

    const [leaves, totalLeaves] = await Promise.all([
      Leave.aggregate(pipeline),
      Leave.countDocuments(match),
    ]);

    return apiResponse(res, StatusCodes.OK, "Leave list fetched successfully", {
      data: leaves,
      pagination: {
        totalCount: totalLeaves,
        totalPages: pagination.page,
        itemsPerPage: resultPerPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateLeave = async (req: any, res: Response) => {
  try {
    const leaveId = req.params.id;


    const leave = await Leave.findById(leaveId);
    if (!leave || leave.isDeleted) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.LEAVE_NOT_FOUND);
    }

    const { date, comments } = req.body;

    if (!Array.isArray(date) || date.length === 0) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Leave dates are required");
    }

    let totalDays = 0;
    const uniqueDates = new Set();

    const newLeaveDates: {
      date: Date;
      leave_type: string;
      totalDays: number;
    }[] = [];

    for (const entry of date) {
      const { date: rawDate, leave_type } = entry;

      if (!rawDate || !leave_type) {
        continue;
      }

      const parsedDate = moment(rawDate).startOf("day").toDate();
      const dateKey = parsedDate.toISOString();

      if (uniqueDates.has(dateKey)) continue;
      uniqueDates.add(dateKey);

      let dayValue = 0;
      if (leave_type === "FULL_DAY") {
        dayValue = 1;
      } else if (["FIRST_HALF", "SECOND_HALF"].includes(leave_type)) {
        dayValue = 0.5;
      }

      totalDays += dayValue;

      newLeaveDates.push({
        date: parsedDate,
        leave_type,
        totalDays: dayValue,
      });
    }

    if (newLeaveDates.length === 0) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Invalid or duplicate leave entries");
    }
    // Updating fields
    leave.set({
      comments: comments || leave.comments,
      date: newLeaveDates.map((d) => d.date),
      leaveDates: newLeaveDates, // Optional: if you use a separate field to store the array
      totalDays,
      leave_type: newLeaveDates.map((d) => d.leave_type).join(", "), // Assuming you want to store a string of leave types
    });

    await leave.save();

    return apiResponse(res, StatusCodes.OK, messages.LEAVE_UPDATED, { leave });
  } catch (error) {
    handleError(res, error);
  }
};


export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const leaveId = req.params.id;
    const existingLeave = await Leave.findOneAndUpdate(
      { _id: leaveId },
      { isDeleted: true },
      { new: true }
    );
    if (existingLeave) {
      return apiResponse(res, StatusCodes.OK, messages.LEAVE_DELETED);
    } else {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_FOUND);
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const approveLeave = async (req: any, res: Response) => {
  try {
    const leaveId = req.params.id;
    const userId = req.userInfo?.id;
    const { status } = req.body;

    if (!["APPROVED", "REJECT"].includes(status)) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Invalid status value");
    }

    const existingLeave = await Leave.findById(leaveId);
    if (!existingLeave || existingLeave.isDeleted) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.LEAVE_NOT_FOUND);
    }

    if (existingLeave.status !== "PENDING") {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Leave already processed");
    }

    const approvedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status, approveById: userId },
      { new: true }
    );

    if (status === "APPROVED") {
      const leaveBalance = await LeaveBalance.findOne({
        employeeId: existingLeave.employeeId,
        isDeleted: false,
      });
      console.log("Leave Balance:", leaveBalance);
      if (leaveBalance?.leave === 0) {
        leaveBalance.extraLeave = leaveBalance?.extraLeave + existingLeave?.totalDays;
      }
      if (!leaveBalance) {
        return apiResponse(res, StatusCodes.BAD_REQUEST, "Leave balance not found");
      }

      leaveBalance.leave = Math.max(leaveBalance.leave - existingLeave.totalDays, 0);
      await leaveBalance.save();
    }

    return apiResponse(res, StatusCodes.OK, "Leave status updated", {
      leave: approvedLeave,
    });
  } catch (error) {
    handleError(res, error);
  }
};


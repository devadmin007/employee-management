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


export const addLeave = async (req: any, res: Response) => {
  try {
    const parseData = leaveSchema.parse(req.body);

    const userId = req.userInfo?.id;
    const {
      startDate,
      endDate,
      start_leave_half_type,
      start_leave_type,
      end_leave_half_type,
      end_leave_type,
      totalDays,
    } = parseData;

    let existingUser: any;

    if (req.userInfo?.role?.role === "EMPLOYEE") {
      existingUser = await UserDetails.findOne({ userId: userId });
    } else if (req.userInfo?.role.role === "PROJECT_MANAGER") {
      const roles = await Role.findOne({ role: "ADMIN" });
      console.log(roles);
      existingUser = await User.findOne({ role: roles?._id });
    }
    if (!existingUser) {
      const roles = await Role.findOne({ role: "ADMIN" });

      existingUser = await User.findOne({ role: roles?._id });
    }

    const existingLeave = await Leave.findOne({
      employeeId: userId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      approveId: existingUser.managerId,
      isDeleted: false,
    });
    if (existingLeave) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_EXIST);
    }

    const leave = await Leave.create({
      employeeId: userId,
      startDate: startDate,
      endDate: endDate,
      comments: parseData.comments,
      status: parseData.status,
      approveId: existingUser?.managerId || existingUser?._id,
      start_leave_half_type,
      start_leave_type,
      end_leave_half_type,
      end_leave_type,
      totalDays,
    });

    if (leave) {
      apiResponse(res, StatusCodes.CREATED, messages.LEAVE_ADDED, {
        leave: leave,
      });
    }
    apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_ADDED);
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
export const leaveList = async (req: Request, res: Response) => {
  try {
    const pagination = paginationObject(req.query);

    const { skip, resultPerPage, sort } = pagination;

    const { status, startDate, endDate } = req.query;

    const match: any = { isDeleted: false };

    if (status) match.status = status;
    if (startDate) match.startDate = { $gte: new Date(startDate as string) };
    if (endDate) {
      match.endDate = match.endDate || {};
      match.endDate.$lte = new Date(endDate as string);
    }

    const pipeline: any = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "approveId",
          foreignField: "_id",
          as: "approveId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "approveById",
          foreignField: "_id",
          as: "approveById",
        },
      },
      {
        $unwind: {
          path: "$approveId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$approveById",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          employeeId: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          comments: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          start_leave_half_type: 1,
          start_leave_type: 1,
          end_leave_half_type: 1,
          end_leave_type: 1,
          totalDays: 1,
          "approveId.firstName": 1,
          "approveId.lastName": 1,
          "approveById.firstName": 1,
          "approveById.lastName": 1,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: resultPerPage },
    ];

    const [leaves, totalLeaves] = await Promise.all([
      Leave.aggregate(pipeline),
      Leave.countDocuments(match),
    ]);

    return apiResponse(res, StatusCodes.OK, "Leave list fetched successfully", {
      data: leaves,
      pagination: {
        total: totalLeaves,
        page: pagination.page,
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
    const userId = req.userInfo?.id;
    const userRole = req.userInfo?.role?.role;

    const leave = await Leave.findById(leaveId);
    if (!leave || leave.isDeleted) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.LEAVE_NOT_FOUND);
    }

    if (userRole === "EMPLOYEE" && !leave.employeeId.equals(userId)) {
      return apiResponse(
        res,
        StatusCodes.FORBIDDEN,
        "You can only update your own leave"
      );
    }

    const { startDate, endDate, comments } = req.body;
    if (startDate && moment(startDate).isBefore(moment(), "day")) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Start date cannot be in the past"
      );
    }

    if (
      endDate &&
      moment(endDate).isBefore(moment(startDate || leave.startDate), "day")
    ) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "End date cannot be before start date"
      );
    }
    if (startDate && !isNaN(Date.parse(startDate))) {
      leave.startDate = new Date(startDate);
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      leave.endDate = new Date(endDate);
    }
    if (comments !== undefined) {
      leave.comments = comments;
    }
    if (startDate) leave.startDate = startDate;
    if (endDate) leave.endDate = endDate;
    if (comments !== undefined) leave.comments = comments;
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

export const approveLeave = async (req: Request, res: Response) => {
  // try {
  //   const leaveId = req.params.id;
  //   const userId = req.userInfo?.id;
  //   const { status } = req.body;
  //   const existingLeave = await Leave.findById(leaveId);
  //   if (!existingLeave) {
  //     return apiResponse(res, StatusCodes.BAD_REQUEST, messages.LEAVE_NOT_FOUND);
  //   }
  //   const approvedLeave = await Leave.findOneAndUpdate(
  //     { _id: leaveId },
  //     { status: status, approveById: userId },
  //     { new: true }
  //   );
  //   if (status === "APPROVED") {
  //     let leaveDays = 0;
  //     const start = moment(existingLeave.startDate).startOf("day");
  //     const end = moment(existingLeave.endDate).startOf("day");
  //     if (existingLeave.leave_type === "FULL_DAY") {
  //       leaveDays = end.diff(start, "days") + 1;
  //     } else if (
  //       existingLeave.leave_type === "FIRST_HALF" ||
  //       existingLeave.leave_type === "SECOND_HALF"
  //     ) {
  //       leaveDays = 0.5;
  //     }
  //     const leaveBalance = await LeaveBalance.findOne({
  //       employeeId: existingLeave.employeeId,
  //       isDeleted: false,
  //     });
  //     if (!leaveBalance) {
  //       return apiResponse(res, StatusCodes.BAD_REQUEST, "Leave balance not found");
  //     }
  //     leaveBalance.leave = Math.max(leaveBalance.leave - leaveDays, 0);
  //     await leaveBalance.save();
  //   }
  //   return apiResponse(res, StatusCodes.OK, "Leave status updated", { leave: approvedLeave });
  // } catch (error) {
  //   handleError(res, error);
  // }
};

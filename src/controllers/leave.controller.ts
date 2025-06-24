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

export const addLeave = async (req: any, res: Response) => {
  try {
    const parseData = leaveSchema.parse(req.body);

    const userId = req.userInfo?.id;
    console.log(req.userInfo);
    const { startDate, endDate } = parseData;

    let existingUser: any;

    if (req.userInfo?.role?.role === "EMPLOYEE") {
      existingUser = await UserDetails.findOne({ userId: userId });
    } else if (req.userInfo?.role.role === "PROJECT_MANAGER") {
      const roles = await Role.findOne({ role: "ADMIN" });
      console.log(roles);
      existingUser = await User.findOne({ role: roles?._id });
    }
    if (!existingUser) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.USER_NOT_FOUND);
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
      comment: parseData.comments,
      status: parseData.status,
      leave_type: parseData.leave_type,
      approveId: existingUser?.managerId || existingUser?._id,
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
          leave_type: 1,
          startDate: 1,
          endDate: 1,
          status: 1,
          comments: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
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

    if (startDate && !isNaN(Date.parse(startDate))) {
      leave.startDate = new Date(startDate);
    }
    if (endDate && !isNaN(Date.parse(endDate))) {
      leave.endDate = new Date(endDate);
    }
    if (comments !== undefined) {
      leave.comments = comments;
    }

    await leave.save();

    return apiResponse(res, StatusCodes.OK, messages.LEAVE_UPDATED, { leave });
  } catch (error) {
    handleError(res, error);
  }
};

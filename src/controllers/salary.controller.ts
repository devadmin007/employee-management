import { Salary } from "../models/salary.model";
import { LeaveBalance } from "../models/leaveBalance.models";
import moment from "moment";
import cron from "node-cron";
import { Request, Response } from "express";
import { handleError } from "../utils/errHandler";
import { salarySchema } from "../utils/zod";
import { apiResponse } from "../utils/apiResponses";
import { StatusCodes } from "http-status-codes";
import { Leave } from "../models/leave.model";
import { messages } from "../utils/messages";
import { User } from "../models/user.model";
import { UserDetails } from "../models/userDetails.model";
import { log } from "console";
import { paginationObject } from "../utils/pagination";


export const generateSalary = async () => {
  try {
    const generatedAt = new Date();
    const currentMonth = moment(generatedAt).format("MMMM");
    const currentYear = moment(generatedAt).year();
    const totalDays = moment(
      `${currentMonth} ${currentYear}`,
      "MMMM YYYY"
    ).daysInMonth();

    const users = await User.find({ isDeleted: false });

    for (const user of users) {
      const employeeId = user._id;

      const userDetails = await UserDetails.findOne({ userId: employeeId });

      if (!userDetails || !userDetails.currentSalary) continue;

      const baseSalary = userDetails.currentSalary;

      const existingSalary = await Salary.findOne({
        employeeId,
        month: currentMonth,
      });
      if (existingSalary) continue;

      const leaveBalance: any = await LeaveBalance.findOne({
        employeeId: employeeId,
      });

      const balance = leaveBalance?.leave;
      const extraLeave = leaveBalance?.extraLeave;

      let leaveDeduct = 0;

      if (balance <= 0 && extraLeave > 0) {
        const perDay = baseSalary / totalDays;
        leaveDeduct = perDay * extraLeave;
      }
      const netSalary = baseSalary - leaveDeduct;
      console.log(currentMonth);
      await Salary.create({
        employeeId,
        leaveDeducation: leaveDeduct,
        netSalary,
        generatedAt,
        month: currentMonth,
      });

      console.log("salary generated completed");
    }
  } catch (error) {
    console.log(`error during salary generation`);
  }
};

export const getSalaryList = async (req: Request, res: Response) => {
  try {
    const pagination = paginationObject(req.query);

    const { skip, resultPerPage, sort } = pagination;
    const match: any = {};
    const { search } = req.query;

    const pipeline: any = [
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeId",
        },
      },
      {
        $unwind: { path: "$employeeId", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          employee_full_name: {
            $concat: ["$employeeId.firstName", " ", "$employeeId.lastName"],
          },
        },
      },
    ];
    if (search) {
      pipeline.push({
        $match: {
          $or: [{ employee_full_name: { $regex: search, $options: "i" } }],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          netSalary: 1,
          month: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          employee_full_name: 1,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: resultPerPage }
    );
    const [salary, totalSalary] = await Promise.all([
      Salary.aggregate(pipeline),
      Salary.countDocuments(match),
    ]);

    return apiResponse(
      res,
      StatusCodes.OK,
      "Salary list fetched successfully",
      {
        data: salary,
        pagination: {
          totalCount: totalSalary,
          totalPages: pagination.page,
          itemsPerPage: resultPerPage,
        },
      }
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const getSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = req.params.id;
    const salary = await Salary.findById(salaryId).populate({
      path: 'employeeId',
      select: '-password' 
    });

    if (!salary) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.SALARY_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.SALARY_FOUND,salary);
  } catch (error) {
    handleError(res, error);
  }
};

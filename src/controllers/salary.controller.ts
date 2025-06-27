import { Salary } from "../models/salary.model";
import { LeaveBalance } from "../models/leaveBalance.models";
import moment from "moment";
import { Request, Response } from "express";
import { handleError } from "../utils/errHandler";
import { salarySchema } from "../utils/zod";
import { apiResponse } from "../utils/apiResponses";
import { StatusCodes } from "http-status-codes";
import { Leave } from "../models/leave.model";
import { messages } from "../utils/messages";

export const addSalary = async (req: Request, res: Response) => {
  try {
    const parseData = salarySchema.parse(req.body);
    const { employeeId, baseSalary, generatedAt, month } = parseData;
    const existingSalary = await Salary.findOne({employeeId:employeeId});

    if(existingSalary){
     return  apiResponse(res,StatusCodes.BAD_REQUEST,messages.SALARY_EXIST)
    }
    const currentYear = new Date().getFullYear();

    const monthName = moment(`${month} ${currentYear}`, "MMMM YYYY");
    if (!monthName.isValid()) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, "Invalid month name");
    }
    const totalDays = monthName.daysInMonth();
    const startDate = monthName.startOf("month").toDate();
    const endDate = monthName.endOf("month").toDate();

    const leaves = await Leave.find({
      employeeId,
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
      status: "APPROVED",
      isDeleted: false,
    });

    let leaveDays = 0;

    for (const leave of leaves) {
      const fromDay = moment.max(
        moment(leave.get("startDate")),
        moment(startDate)
      );
      const endDay = moment.min(moment(leave.get("endDate")), moment(endDate));
      for (let d = fromDay.clone(); d.isSameOrBefore(endDay); d.add(1, "day")) {
        if (d.day() !== 0 && d.day() !== 6) {
          leaveDays++;
        }
      }
    }
    const balance:any = await LeaveBalance.findOne({ employeeId:employeeId });
console.log(balance)
    const leaveBalance = balance?.leave || 0;

    const extraLeave = Math.max(leaveDays - leaveBalance, 0);
    const perDay = baseSalary / totalDays;
    const leaveDeduction = perDay * balance?.extraLeave;
    console.log(leaveDeduction)
    const netSalary = baseSalary - leaveDeduction;

    await Salary.create({
      employeeId,
      baseSalary,
      generatedAt,
      leaveDeduction,
      netSalary,
      month,
    });

    apiResponse(res, StatusCodes.CREATED, messages.SALARY_GENERETED, {
      employeeId,
      baseSalary,
      leaveDeduction,
      netSalary,
      month,
    });
  } catch (error) {
    handleError(res, error);
  }
};

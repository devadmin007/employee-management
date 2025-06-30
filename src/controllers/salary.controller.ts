import { Salary } from "../models/salary.model";
import { LeaveBalance } from "../models/leaveBalance.models";
import moment from "moment";
import { PassThrough } from "stream";
import { Request, Response } from "express";
import { handleError } from "../utils/errHandler";

import { apiResponse } from "../utils/apiResponses";
import { StatusCodes } from "http-status-codes";

import { messages } from "../utils/messages";
import { User } from "../models/user.model";
import { UserDetails } from "../models/userDetails.model";

import { paginationObject } from "../utils/pagination";
import PDFDocument from "pdfkit";
// import * as getStream from "get-stream";
import getStream from "get-stream";
import { Cloudinary } from "../utils/cloudinary";

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
        extraLeave
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
    const { search, month } = req.query;
    if (month) {
      match.month = { $regex: `^${month}$`, $options: "i" };
    }
    const pipeline: any = [
      {
        $match: match,
      },
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
          extraLeave: 1
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
      path: "employeeId",
      select: "-password",
    });

    if (!salary) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.SALARY_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.SALARY_FOUND, salary);
  } catch (error) {
    handleError(res, error);
  }
};


export const addSalaryPdf = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;

    if (!month && !year) {
      return handleError(res, {
        message: "Please provide at least month or a year",
      });
    }

    // Build match filter
    const match: any = {};
    if (month) {
      match.month = { $regex: `^${month}$`, $options: "i" };
    }
    if (year) {
      match.generatedAt = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    // Fetch salary records
    const salaries = await Salary.find(match).populate({
      path: "employeeId",
      select: "firstName lastName email employeeId",
    });

    if (salaries.length === 0) {
      return handleError(res, {
        message: `No salary records found for ${month || ""} ${year || ""}`.trim(),
      });
    }

    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      const fileObj = {
        originalname: `salary-report-${month || year}-${Date.now()}.pdf`,
        buffer: pdfBuffer,
      } as Express.Multer.File;

      const result = await Cloudinary.uploadToCloudinary(fileObj, "emp");

      return apiResponse(
        res,
        StatusCodes.CREATED,
        "PDF file has been generated successfully",
        { pdfUrl: result.secure_url }
      );
    });

    // PDF Content
    doc.fontSize(16).text(`Salary Report - ${month || ""} ${year || ""}`.trim(), {
      align: "center",
    });
    doc.moveDown();

    salaries.forEach((salary, index) => {
      const employee = salary.employeeId as any;
      doc
        .fontSize(12)
        .text(`${index + 1}. ${employee.firstName} ${employee.lastName}`);
      doc.text(`   Email: ${employee.email}`);
      doc.text(`   Net Salary: ₹${salary.netSalary}`);
      doc.text(`   Leave Deduction: ₹${salary.leaveDeducation}`);
      doc.text(`   Generated At: ${moment(salary.generatedAt).format("YYYY-MM-DD")}`);
      doc.moveDown();
    });

    doc.end(); // this triggers 'end' event above

  } catch (error) {
    handleError(res, error);
  }
};
